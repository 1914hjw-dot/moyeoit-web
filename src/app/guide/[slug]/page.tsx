import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  ExternalLink,
  Sparkles,
  UserRound,
} from '@/components/ui/GuideIcons';
import { Footer } from '@/components/ui/Footer';
import { getGuideArticle } from '@/content/guides';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://moyeoit-web.vercel.app';

interface GuideDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function GuideDetailPage({ params }: GuideDetailPageProps) {
  const { slug } = await params;
  const article = getGuideArticle(slug);

  if (!article) {
    notFound();
  }

  const articleUrl = `${SITE_URL}/guide/${article.slug}`;
  const relatedArticles = article.relatedSlugs
    .map((relatedSlug) => getGuideArticle(relatedSlug))
    .filter((relatedArticle) => relatedArticle !== undefined);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    inLanguage: 'ko-KR',
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    articleSection: article.category,
    keywords: article.keywords.join(', '),
    mainEntityOfPage: articleUrl,
    author: {
      '@type': 'Organization',
      name: article.author,
      url: `${SITE_URL}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: '모여잇 (Moyeoit)',
      url: SITE_URL,
    },
    image: `${SITE_URL}/api/og?title=${encodeURIComponent(article.title)}`,
  };
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '모여잇', item: SITE_URL },
      {
        '@type': 'ListItem',
        position: 2,
        name: '가이드 센터',
        item: `${SITE_URL}/guide`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: articleUrl,
      },
    ],
  };

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-4 py-6 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <header className="flex items-center justify-between pb-3 border-b border-slate-200/80">
        <Link
          href="/guide"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>가이드 센터로 돌아가기</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-xs font-black text-slate-900">모여잇 가이드</span>
        </div>
      </header>

      <article className="sys-card p-6 sm:p-10 space-y-9 bg-white border-slate-200/80 shadow-xl shadow-slate-200/50 rounded-3xl">
        <header className="space-y-5 pb-7 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
              {article.category}
            </span>
            <span className="text-xs text-slate-500 font-semibold">{article.readTime}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {article.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 font-medium leading-7">
            {article.description}
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
            <Link href="/about" className="inline-flex items-center gap-1.5 hover:text-slate-900">
              <UserRound className="w-3.5 h-3.5" />
              <span>작성: {article.author}</span>
            </Link>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" />
              <span>
                최초 작성 <time dateTime={article.publishedAt}>{article.publishedAt}</time>
              </span>
            </span>
            <span>
              최종 수정 <time dateTime={article.updatedAt}>{article.updatedAt}</time>
            </span>
          </div>
        </header>

        <aside className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 space-y-2">
          <h2 className="text-sm font-black text-emerald-950">이 글의 작성 기준</h2>
          <p className="text-xs sm:text-sm leading-6 text-emerald-900">
            서비스 기능을 기준으로 작성한 이용 안내와 모임 운영 제안입니다.
            인원·금액·메시지는 설명용 가상 예시이며 실제 이용자의 사례나 측정 결과가 아닙니다.
            마감 확인과 재안내는 방장이 직접 수행합니다.
          </p>
        </aside>

        <div className="space-y-4 text-sm sm:text-base text-slate-700 leading-7">
          {article.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="space-y-10">
          {article.sections.map((section) => (
            <section key={section.heading} className="space-y-4 scroll-mt-20">
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 leading-snug">
                {section.heading}
              </h2>

              <div className="space-y-3 text-sm sm:text-base text-slate-700 leading-7">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              {section.bullets && (
                <ul className="space-y-2 rounded-2xl bg-slate-50 border border-slate-200/80 p-5">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2.5 text-sm text-slate-700 leading-6">
                      <Check className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}

              {section.example && (
                <div className="rounded-2xl bg-indigo-50/70 border border-indigo-100 p-5 space-y-2">
                  <h3 className="text-sm font-black text-indigo-950">{section.example.title}</h3>
                  <p className="text-sm text-indigo-900 leading-6">{section.example.body}</p>
                </div>
              )}
            </section>
          ))}
        </div>

        <section className="p-6 rounded-2xl bg-slate-900 text-white space-y-3">
          <h2 className="text-base font-black">핵심 정리</h2>
          <p className="text-sm text-slate-200 leading-7">{article.conclusion}</p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-slate-900 font-black text-xs hover:bg-slate-100 transition-all shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>모여잇에서 약속 방 만들기</span>
            </Link>
          </div>
        </section>

        <section className="pt-2 border-t border-slate-100 space-y-4">
          <h2 className="text-base font-black text-slate-900">함께 읽으면 좋은 가이드</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relatedArticles.map((relatedArticle) => (
              <Link
                key={relatedArticle.slug}
                href={`/guide/${relatedArticle.slug}`}
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2 hover:bg-slate-100 transition-colors"
              >
                <span className="text-[10px] font-bold text-indigo-700">{relatedArticle.category}</span>
                <h3 className="text-sm font-black text-slate-900 leading-snug">
                  {relatedArticle.title}
                </h3>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700">
                  읽으러 가기 <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <footer className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-600">
          <Link href="/guide" className="hover:text-slate-900 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>다른 가이드 둘러보기</span>
          </Link>
          <Link href="/about" className="hover:text-slate-900 flex items-center gap-1">
            <span>작성자와 서비스 소개</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </footer>
      </article>

      <Footer />
    </main>
  );
}
