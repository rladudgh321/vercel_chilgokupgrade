
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Listing Stats
    const { count: totalListings } = await supabase.from('Build').select('*', { count: 'exact', head: true });
    const { data: viewsData, error: viewsError } = await supabase.from('Build').select('views').eq('visibility', true);
    if (viewsError) console.error('Error fetching views:', viewsError);
    const totalViews = viewsData?.reduce((acc, curr) => acc + (curr.views || 0), 0) || 0;

    // Inquiry Stats
    const { data: inquiryData, error: inquiryError } = await supabase.from('Order').select('category').eq('confirm', false);
    if (inquiryError) {
        Sentry.captureException(inquiryError);
          await notifySlack(inquiryError, req.url);
    }
    
    const inquiryStats = {
      buy: inquiryData?.filter(i => i.category === '매수').length || 0,
      sell: inquiryData?.filter(i => i.category === '매도').length || 0,
      other: inquiryData?.filter(i => i.category === '기타').length || 0,
    };

    // Contact Requests
    const { count: contactRequests } = await supabase.from('ContactRequest').select('*', { count: 'exact', head: true }).eq('confirm', false);

    // Category Views
    const { data: buildsForCategories, error: buildsForCatError } = await supabase.from('Build').select('views, listingTypeId').gt('views', 0).not('listingTypeId', 'is', null);
    if (buildsForCatError) {
      Sentry.captureException(buildsForCatError);
          await notifySlack(buildsForCatError, req.url);
    }
    const { data: listingTypes, error: listingTypesError } = await supabase.from('ListingType').select('id, name');
    if (listingTypesError) {
      Sentry.captureException(listingTypesError);
          await notifySlack(listingTypesError, req.url);
    }

    const categoryViewsMap = new Map<number, { name: string; value: number }>();
    if (listingTypes) {
      listingTypes.forEach(lt => {
        categoryViewsMap.set(lt.id, { name: lt.name, value: 0 });
      });
    }
    if (buildsForCategories) {
      buildsForCategories.forEach(build => {
        const category = categoryViewsMap.get(build.listingTypeId);
        if (category && build.views) {
          category.value += build.views;
        }
      });
    }
    const categoryViews = Array.from(categoryViewsMap.values()).sort((a, b) => b.value - a.value);

    // Theme Views
    const { data: buildsForThemes, error: buildsForThemesError } = await supabase.from('Build').select('themes, views').gt('views', 0);
    if (buildsForThemesError) console.error('Error fetching builds for themes:', buildsForThemesError);
    const themeViewsMap = new Map<string, number>();
    if (buildsForThemes) {
      buildsForThemes.forEach(build => {
        if (build.views && build.themes) {
          build.themes.forEach(theme => {
            themeViewsMap.set(theme, (themeViewsMap.get(theme) || 0) + build.views);
          });
        }
      });
    }
    const themeViews = Array.from(themeViewsMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Top 5 Listings
    const { data: topListings, error: topListingsError } = await supabase.from('Build').select('address, views').eq('visibility', true).not('address', 'is', null).order('views', { ascending: false }).limit(5);
    if (topListingsError) {
      Sentry.captureException(topListingsError);
          await notifySlack(topListingsError, req.url);
    }

    const data = {
      listingStats: { totalListings: totalListings || 0, totalViews },
      inquiryStats,
      contactRequests: contactRequests || 0,
      categoryViews,
      themeViews,
      topListings: topListings?.map(l => ({ address: l.address!, views: l.views || 0})) || [],
    };

    return NextResponse.json(data);
  } catch (e: any) {
      Sentry.captureException(e);
      await notifySlack(e, req.url);
    return NextResponse.json({ message: e?.message ?? "서버 오류" }, { status: 500 });
  }
}
