import { MetadataRoute } from 'next';
import { GUIDE_SUMMARIES } from '@/content/guide-catalog';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://moyeoit-web.vercel.app';
const SITE_UPDATED_AT = '2026-09-03';

export default function sitemap(): MetadataRoute.Sitemap {
  const guideRoutes: MetadataRoute.Sitemap = GUIDE_SUMMARIES.map((article) => ({
    url: `${SITE_URL}/guide/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: SITE_UPDATED_AT,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: SITE_UPDATED_AT,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/help`,
      lastModified: SITE_UPDATED_AT,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/guide`,
      lastModified: SITE_UPDATED_AT,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...guideRoutes,
    {
      url: `${SITE_URL}/contact`,
      lastModified: SITE_UPDATED_AT,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: SITE_UPDATED_AT,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: SITE_UPDATED_AT,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];
}
