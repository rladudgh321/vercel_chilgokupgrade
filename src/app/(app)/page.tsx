import { Suspense } from "react";
import MainPicture, { Banner } from "../components/root/1MainPicture";
import SearchMapList from "../components/root/2SearchMapList";
import WhatTypeLand, { ListingTypeProps } from "../components/root/3WhatTypeLand";
import IfLandType, { ThemeImageProps } from "../components/root/4IfLandType";
import HomePageClient from "./HomePageClient";
import Contact from "../components/root/8Contact";
import ContactForm from "../components/root/8Contact/ContactForm";
import Institue from "../components/root/9Institue";
import Popup from "../components/root/Popup";
import { PopupPost } from "../components/root/Popup";
import type { Metadata } from 'next';
import { generatePageMetadata } from '@/app/utils/metadata';

export async function generateMetadata(): Promise<Metadata> {
  // Homepage specific metadata
  return generatePageMetadata({
    title: '칠곡군 대표 부동산, 빠르고 정확한 실매물 정보',
    description: '칠곡군 전역의 아파트, 상가, 원룸, 토지 등 모든 종류의 부동산 매물을 찾아보세요. 급매, 인기 매물, 최신 매물을 한눈에 확인할 수 있습니다.',
    keywords: ['칠곡군 부동산', '칠곡 아파트', '칠곡 상가', '왜관 부동산', '석적 부동산', '북삼 부동산', '칠곡 원룸', '칠곡 토지'],
  });
}


const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!

async function getPopupPosts(): Promise<PopupPost[]> {
  const res = await fetch(`${BASE_URL}/api/popup`, { cache: 'force-cache', next: { tags: ['public', 'popup'] } });
  if(!res.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await res.json();
  return data.data;
}

async function getBanners(): Promise<Banner[]> {
    const res = await fetch(`${BASE_URL}/api/admin/webView/banner`, { cache: 'force-cache', next: { tags: ['public', 'banner'] }});
    if(!res.ok) {
      throw new Error('Network response was not ok');
    }
    const banners = await res.json()
    return banners.data;
}

async function getListingType(): Promise<ListingTypeProps[]> {
    const res = await fetch(`${BASE_URL}/api/listing-type`, { 
    cache: 'force-cache',
    next: {
      tags: ['public', 'listing-type']
    }});
    if(!res.ok) {
      throw new Error('Network response was not ok');
    }
    const json = await res.json();
    const rows: Array<{ name?: string; imageUrl?: string }> = json?.data ?? [];
    return rows
      .map(r => ({ name: (r?.name ?? '').trim(), imageUrl: r?.imageUrl }))
      .filter(p => p.name.length > 0 && p.imageUrl); // Only show items with images
}

async function getThemeImage(): Promise<ThemeImageProps[]> {
    const res = await fetch(`${BASE_URL}/api/theme-images`, {
      cache: 'force-cache',
      next: { tags: ['public', 'theme-image'] }
    });
    if(!res.ok) {
      throw new Error('Network response was not ok');
    }
    const json = await res.json();
    const data: Array<{ label?: string; imageUrl?: string; isActive?: boolean }> = json?.data;
    const active = data.filter(x => (x.isActive === undefined || x.isActive === true) && x.label);
    return active.map(x => {
      const label = String(x.label);
      const image = x.imageUrl?.trim();
      return {
        name: label,
        image,
        theme: label,
      };
    });
}

export type ListingSectionProps = {
  currentPage: number; 
  listings: any[]; 
  totalPage: number;
}

async function getPopular(): Promise<ListingSectionProps> {
  const res = await fetch(`${BASE_URL}/api/listings?popularity=인기&limit=10`, { cache: 'force-cache', next: { tags: ['public', 'popular'] } });
  if(!res.ok) {
    throw new Error('Network response was not ok');
  }
  const json = await res.json();
  return (json?.listings && Array.isArray(json?.listings)) ? json :  { currentPage: 1, totalPage: 1, listings: [] }
}

async function getQuickSale(): Promise<ListingSectionProps> {
  const res = await fetch(`${BASE_URL}/api/listings?popularity=급매&limit=10`, { cache: 'force-cache', next: { tags: ['public', 'quick-sale'] } });
  if(!res.ok) {
    throw new Error('Network response was not ok');
  }
  const json = await res.json();
  return (json?.listings && Array.isArray(json?.listings)) ? json :  { currentPage: 1, totalPage: 1, listings: [] }
}

async function getRecently(): Promise<ListingSectionProps> {
  const res = await fetch(`${BASE_URL}/api/listings?sortBy=latest&limit=10`, { cache: 'force-cache', next: { tags: ['public', 'recently'] } });
  if(!res.ok) {
    throw new Error('Network response was not ok');
  }
  const json = await res.json();
  return (json?.listings && Array.isArray(json?.listings)) ? json :  { currentPage: 1, totalPage: 1, listings: [] }
}


const Home = async () => {
  const popups = getPopupPosts();
  const banners = getBanners();
  const listingType = getListingType();
  const themeImage = getThemeImage();
  const RecommendData = getPopular();
  const QuickSaleData = getQuickSale();
  const RecentlyData = getRecently();
  return (
    <main>
      <Suspense fallback={<div>로딩 중...</div>}>
        <Popup popups={popups} />
      </Suspense>
      <MainPicture banners={banners} />
      <SearchMapList />
      <WhatTypeLand listingType={listingType} />
      <IfLandType themeImage={themeImage} />
      <Suspense fallback={<div>로딩 중...</div>}>
        <HomePageClient RecommendData={RecommendData!} QuickSaleData={QuickSaleData!} RecentlyData={RecentlyData!} />
      </Suspense>
      <Contact>
        <Suspense fallback={<div>로딩 중...</div>}>
          <ContactForm />
        </Suspense>
      </Contact>
      <Institue />
    </main>
  );
}

export default Home;