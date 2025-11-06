import { BuildFindAll } from "@/app/apis/build";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "12", 10);
  const keyword = searchParams.get("keyword") || undefined;
  const theme = searchParams.get("theme") || undefined;
  const propertyType = searchParams.get("propertyType") || undefined;
  const buyType = searchParams.get("buyType") || undefined;
  const rooms = searchParams.get("rooms") || undefined;
  const bathrooms = searchParams.get("bathrooms") || undefined;
  const sortBy = searchParams.get("sortBy") || "latest";
  const popularity = searchParams.get("popularity") || undefined;

  try {
    const { data: processedListings, totalPages } = await BuildFindAll(
      page,
      limit,
      keyword,
      {
        theme,
        propertyType,
        buyType,
        rooms,
        bathrooms,
        popularity,
      },
      sortBy
    );

    return NextResponse.json({
      listings: processedListings,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    Sentry.captureException(error);
    await notifySlack(error, request.url);
    return NextResponse.json(
      { message: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}
