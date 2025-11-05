import { Suspense } from "react";
import MainPicture, { Banner } from "../components/root/1MainPicture";
import SearchMapList from "../components/root/2SearchMapList";
import WhatTypeLand, { ListingTypeProps } from "../components/root/3WhatTypeLand";
import IfLandType, { ThemeImageProps } from "../components/root/4IfLandType";
import ListingSection, { Listing } from "../components/root/ListingSection";
import Contact from "../components/root/8Contact";
import ContactForm from "../components/root/8Contact/ContactForm";
import Institue from "../components/root/9Institue";
import Popup from "../components/root/Popup";
import { PopupPost } from "../components/root/Popup";

export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!

async function getPopupPosts(): Promise<PopupPost[]> {
  const res = await fetch(`${BASE_URL}/api/popup`, { next: { tags: ['public', 'popup'], revalidate: 28800 } });
  if(!res.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await res.json();
  return data.data;
}

async function getBanners(): Promise<Banner[]> {
    const res = await fetch(`${BASE_URL}/api/admin/webView/banner`, { next: { tags: ['public', 'banner'], revalidate: 28800 }});
    if(!res.ok) {
      throw new Error('Network response was not ok');
    }
    const banners = await res.json()
    return banners.data;
}

async function getListingType(): Promise<ListingTypeProps[]> {
    const res = await fetch(`${BASE_URL}/api/listing-type`, { next: {
      tags: ['public', 'listing-type'], revalidate: 28800
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
      next: { tags: ['public', 'theme-image'], revalidate: 28800 }
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

async function getIpStatus(): Promise<{isBanned: boolean}> {
  const res = await fetch(`${BASE_URL}/api/ip-status`, { next: { tags: ['public', 'ip-status'], revalidate: 28800 } });
  if(!res.ok) {
    throw new Error('Network response was not ok');
  }
  return await res.json();
}

export type ListingSectionProps = {
  currentPage: number; 
  listings: Listing[]; 
  totalPage: number;
}

async function getPopular(): Promise<ListingSectionProps> {
  const res = await fetch(`${BASE_URL}/api/listings?sortBy=popular&limit=10`, { next: { tags: ['public', 'popular'], revalidate: 28800 } });
  if(!res.ok) {
    throw new Error('Network response was not ok');
  }
  const json = await res.json();
  return (json?.listings && Array.isArray(json?.listings)) ? json :  { currentPage: 1, totalPage: 1, listings: [] }
}

async function getQuickSale(): Promise<ListingSectionProps> {
  const res = await fetch(`${BASE_URL}/api/listings?label=급매&limit=10`, { next: { tags: ['public', 'quick-sale'], revalidate: 28800 } });
  if(!res.ok) {
    throw new Error('Network response was not ok');
  }
  const json = await res.json();
  return (json?.listings && Array.isArray(json?.listings)) ? json :  { currentPage: 1, totalPage: 1, listings: [] }
}

async function getRecently(): Promise<ListingSectionProps> {
  const res = await fetch(`${BASE_URL}/api/listings?sortBy=latest&limit=10`, { next: { tags: ['public', 'recently'], revalidate: 28800 } });
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
  const isBanned = getIpStatus();
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
        <ListingSection RecommendData={RecommendData!} QuickSaleData={QuickSaleData!} RecentlyData={RecentlyData!} />
      </Suspense>
      <Contact>
        <Suspense fallback={<div>로딩 중...</div>}>
          <ContactForm isBanned={isBanned} />
        </Suspense>
      </Contact>
      <Institue />
    </main>
  );
}

export default Home;