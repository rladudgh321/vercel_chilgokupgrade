import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";
import { formatInTimeZone } from 'date-fns-tz';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
      ipAddress,
      contact,
      details,
      deleteAll = false,
    } = await req.json();

    if (!ipAddress) {
      return NextResponse.json(
        { error: "IP address is required" },
        { status: 400 }
      );
    }

    const now = new Date();
    const kstDateString = formatInTimeZone(now, 'Asia/Seoul', "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");

    // Add to BannedIp table
    const { error: banError } = await supabase.from("BannedIp").insert({
      ipAddress: ipAddress,
      contact: contact,
      details: details,
      createdAt: kstDateString,
      updatedAt: kstDateString,
    });

    if (banError) {
      // Handle potential unique constraint violation gracefully
      Sentry.captureException(banError);
          await notifySlack(banError, req.url);
      if (banError.code === "23505") {
        console.log(`IP address ${ipAddress} is already banned.`);
      } else {
        throw banError;
      }
    }

    if (deleteAll) {
      // Delete all entries from ContactRequest and Order
      const { error: contactError } = await supabase
        .from("ContactRequest")
        .delete()
        .match({ ipAddress: ipAddress });
      if (contactError) {
          Sentry.captureException(contactError);
          await notifySlack(contactError, req.url);
        throw contactError
      }

      const { error: orderError } = await supabase
        .from("Order")
        .delete()
        .match({ ipAddress: ipAddress });
      if (orderError) {
        Sentry.captureException(orderError);
        await notifySlack(orderError, req.url);
        throw orderError;

      }
    }

    return NextResponse.json({ message: "IP address processed successfully" });
  } catch (error) {
      Sentry.captureException(error);
      await notifySlack(error, req.url);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "An error occurred while processing the request.", details: errorMessage },
      { status: 500 }
    );
  }
}
