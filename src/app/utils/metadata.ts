import type { Metadata } from 'next';

interface GenerateMetadataProps {
  title?: string;
  description?: string;
  keywords?: string[];
  openGraph?: {
    title?: string;
    description?: string;
    url?: string;
    siteName?: string;
    images?: string | string[];
    type?: 'website' | 'article';
  };
  twitter?: {
    card?: 'summary_large_image' | 'summary' | 'app';
    site?: string;
    creator?: string;
    title?: string;
    description?: string;
    images?: string | string[];
  };
}

export function generatePageMetadata(props: GenerateMetadataProps): Metadata {
  const defaultTitle = '칠곡군 부동산'; // 기본 타이틀
  const defaultDescription = '칠곡군 부동산 정보, 매물, 소식, 전문가 정보 등을 제공합니다.'; // 기본 설명
  const defaultKeywords = ['칠곡군 부동산', '칠곡 부동산', '칠곡군 아파트', '칠곡군 상가']; // 기본 키워드

  const title = props.title ? `${props.title} | ${defaultTitle}` : defaultTitle;
  const description = props.description || defaultDescription;
  const keywords = props.keywords || defaultKeywords;

  return {
    title,
    description,
    keywords,
    openGraph: {
      title: props.openGraph?.title || title,
      description: props.openGraph?.description || description,
      url: props.openGraph?.url || process.env.NEXT_PUBLIC_SITE_URL || 'https://your-site-url.com',
      siteName: props.openGraph?.siteName || defaultTitle,
      images: props.openGraph?.images || '/logo.png', // 기본 이미지 경로
      type: props.openGraph?.type || 'website',
    },
    twitter: {
      card: props.twitter?.card || 'summary_large_image',
      site: props.twitter?.site || '@your_twitter_handle',
      creator: props.twitter?.creator || '@your_twitter_handle',
      title: props.twitter?.title || title,
      description: props.twitter?.description || description,
      images: props.twitter?.images || '/logo.png', // 기본 이미지 경로
    },
    // 기타 필요한 메타데이터 추가
  };
}
