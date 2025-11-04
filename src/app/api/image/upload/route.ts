import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { S3client, PUBLIC_BUCKET, supabasePublicUrl, makeObjectKey } from '@/app/api/supabase/S3';
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";
import sharp from 'sharp';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    const bucket = (form.get('bucket') as string) || PUBLIC_BUCKET;
    const prefix = (form.get('prefix') as string) || 'main';

    if (!(file instanceof File)) {
      return NextResponse.json({ message: 'file 필드가 필요합니다.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const processedImage = await sharp(buffer)
      .resize({
        width: 1600,
        withoutEnlargement: true, // 원본보다 클 경우 확대하지 않음
        fit: "inside",             // 비율 유지
      })
      .webp({ quality: 80, effort: 6, smartSubsample: true, nearLossless: false })
      .toBuffer();

    const originalName = file.name.substring(0, file.name.lastIndexOf('.'));
    const Key = makeObjectKey(`${originalName}.webp`, prefix);

    await S3client.send(new PutObjectCommand({
      Bucket: bucket,
      Key,
      Body: processedImage,
      ContentType: 'image/webp',
    }));

    const url = supabasePublicUrl(bucket, Key);
    return NextResponse.json({ bucket, key: Key, url });
  } catch (e: any) {
    Sentry.captureException(e);
    await notifySlack(e, req.url);
    return NextResponse.json({ message: e?.message ?? '업로드 실패' }, { status: 500 });
  }
}
