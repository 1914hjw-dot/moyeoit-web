import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { GUIDE_SUMMARIES } from '../src/content/guide-catalog.ts';
import { GUIDE_ARTICLES, getGuideArticle } from '../src/content/guides.ts';

test('guide catalog has unique URLs and distinct metadata', () => {
  for (const field of ['slug', 'title', 'description'] as const) {
    assert.equal(new Set(GUIDE_SUMMARIES.map((article) => article[field])).size, GUIDE_SUMMARIES.length);
  }
  assert.deepEqual(GUIDE_ARTICLES.map((article) => article.slug), GUIDE_SUMMARIES.map((article) => article.slug));
  for (const article of GUIDE_ARTICLES) {
    assert.match(article.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.equal(getGuideArticle(article.slug), article);
    assert.ok(article.intro.length && article.sections.length && article.conclusion);
  }
  assert.equal(getGuideArticle('missing-guide'), undefined);
});

test('guide dates and related links are valid', () => {
  for (const article of GUIDE_ARTICLES) {
    for (const date of [article.publishedAt, article.updatedAt]) {
      assert.match(date, /^\d{4}-\d{2}-\d{2}$/);
      assert.equal(new Date(date).toISOString().slice(0, 10), date);
    }
    assert.ok(article.updatedAt >= article.publishedAt);
    assert.equal(new Set(article.relatedSlugs).size, article.relatedSlugs.length);
    for (const slug of article.relatedSlugs) {
      assert.notEqual(slug, article.slug);
      assert.ok(getGuideArticle(slug), `Missing related guide: ${slug}`);
    }
  }
});

test('content examples do not contain the removed performance claims', () => {
  const content = JSON.stringify(GUIDE_ARTICLES);
  assert.doesNotMatch(content, /80%|200%|\d+초 만에/);
});

test('ads.txt contains a single valid Google publisher entry', async () => {
  const ads = await readFile(new URL('../public/ads.txt', import.meta.url), 'utf8');
  assert.match(ads.trim(), /^google\.com, pub-\d{16}, DIRECT, f08c47fec0942fa0$/);
});

const baseUrl = process.env.CONTENT_TEST_BASE_URL;

test('rendered content, metadata and ad exclusions', { skip: !baseUrl }, async (t) => {
  assert.ok(baseUrl);
  assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(new URL(baseUrl).hostname), 'Use a local test server.');

  async function getPage(path: string, status = 200) {
    const response = await fetch(new URL(path, baseUrl), { signal: AbortSignal.timeout(15_000) });
    assert.equal(response.status, status, path);
    return response.text();
  }

  function attribute(tag: string, name: string) {
    return tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
  }

  const ads = await getPage('/ads.txt');
  const publisher = ads.match(/pub-\d{16}/)?.[0];
  assert.ok(publisher);
  const sitemap = await getPage('/sitemap.xml');
  const locations = Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => new URL(match[1]));
  assert.deepEqual(
    locations.filter((url) => url.pathname.startsWith('/guide/')).map((url) => url.pathname).sort(),
    GUIDE_SUMMARIES.map((article) => `/guide/${article.slug}`).sort(),
  );
  assert.equal(locations.some((url) => url.pathname.startsWith('/room/')), false);

  for (const article of GUIDE_ARTICLES) {
    await t.test(article.slug, async () => {
      const html = await getPage(`/guide/${article.slug}`);
      const metaTags = html.match(/<meta\b[^>]*>/g) ?? [];
      const description = metaTags.find((tag) => attribute(tag, 'name') === 'description');
      assert.ok(description);
      assert.equal(attribute(description, 'content'), article.description);
      assert.ok(html.includes(`<title>${article.title} | 모여잇 가이드</title>`));
      assert.ok(html.includes(article.sections[0].paragraphs[0]));

      const canonical = (html.match(/<link\b[^>]*>/g) ?? []).find((tag) => attribute(tag, 'rel') === 'canonical');
      assert.ok(canonical);
      assert.equal(new URL(attribute(canonical, 'href')!).pathname, `/guide/${article.slug}`);

      const schemas = Array.from(
        html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
        (match) => JSON.parse(match[1]) as Record<string, unknown>,
      );
      const articleSchema = schemas.find((schema) => schema['@type'] === 'Article');
      assert.ok(articleSchema);
      assert.equal(articleSchema.headline, article.title);
      assert.equal(articleSchema.dateModified, article.updatedAt);
      assert.equal(articleSchema.mainEntityOfPage, attribute(canonical, 'href'));
      assert.ok(schemas.some((schema) => schema['@type'] === 'BreadcrumbList'));
      assert.doesNotMatch(html, /class="adsbygoogle"|data-ad-slot=|pagead\/js\/adsbygoogle/);
      assert.ok(html.includes(`ca-${publisher}`));
    });
  }

  for (const path of ['/guide', '/about', '/help', '/privacy', '/terms', '/contact', '/room/demo-room-1']) {
    await t.test(`ad exclusion: ${path}`, async () => {
      const html = await getPage(path);
      assert.doesNotMatch(html, /class="adsbygoogle"|data-ad-slot=|pagead\/js\/adsbygoogle/);
    });
  }
  await t.test('missing guide returns 404 without ads', async () => {
    const html = await getPage('/guide/missing-guide', 404);
    assert.doesNotMatch(html, /class="adsbygoogle"|data-ad-slot=/);
  });
});
