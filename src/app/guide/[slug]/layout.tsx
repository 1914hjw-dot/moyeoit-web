import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GUIDE_ARTICLES, getGuideArticle } from '@/content/guides';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://moyeoit-web.vercel.app';

export function generateStaticParams() {
  return GUIDE_ARTICLES.map((article) => ({ slug: article.slug }));
}

interface GuideLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: GuideLayoutProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getGuideArticle(slug);

  if (!article) {
    notFound();
  }

  const canonicalUrl = `${SITE_URL}/guide/${article.slug}`;
  const imageUrl = `${SITE_URL}/api/og?title=${encodeURIComponent(article.title)}`;

  return {
    title: `${article.title} | 모여잇 가이드`,
    description: article.description,
    keywords: [...article.keywords],
    authors: [{ name: article.author, url: `${SITE_URL}/about` }],
    creator: article.author,
    publisher: '모여잇 (Moyeoit)',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'article',
      locale: 'ko_KR',
      url: canonicalUrl,
      siteName: '모여잇 (Moyeoit)',
      title: article.title,
      description: article.description,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author],
      section: article.category,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
      images: [imageUrl],
    },
  };
}

export default function GuideSlugLayout({ children }: GuideLayoutProps) {
  return <>{children}</>;
}
