import { NextResponse } from 'next/server';
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { confirm, note } = body;

    const updateData: { confirm?: boolean; note?: string } = {};

    if (typeof confirm === 'boolean') {
      updateData.confirm = confirm;
    }

    if (typeof note === 'string') {
      updateData.note = note;
    }

    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from('Order')
      .update(updateData)
      .eq('id', parseInt(id, 10))
      .select();

    if (error) {
      Sentry.captureException(error);
      await notifySlack(error, request.url);
      return NextResponse.json({ error: `Error updating order ${id}` }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    Sentry.captureException(error);
    await notifySlack(error, request.url);
    return NextResponse.json({ error: `Error updating order ${params.id}` }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase
      .from('Order')
      .delete()
      .eq('id', parseInt(id, 10));

    if (error) {
      Sentry.captureException(error);
      await notifySlack(error, request.url);
      return NextResponse.json({ error: `Error deleting order ${id}` }, { status: 500 });
    }

    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    Sentry.captureException(error);
    await notifySlack(error, request.url);
    return NextResponse.json({ error: `Error deleting order ${params.id}` }, { status: 500 });
  }
}