import { NextRequest, NextResponse } from 'next/server';
import { Upload } from '@aws-sdk/lib-storage';
import { S3client, PUBLIC_BUCKET, supabasePublicUrl, makeObjectKey } from '@/app/api/supabase/S3';
import * as Sentry from "@sentry/nextjs";
import { notifySlack } from "@/app/utils/sentry/slack";
import sharp from 'sharp';



export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const bucketFromForm = form.get('bucket') as string | null;
    const prefix = (form.get('prefix') as string) || 'sub';

    const bucket = bucketFromForm || PUBLIC_BUCKET;  // ✅ 기본값
    if (!bucket) {
      return NextResponse.json({ message: 'Bucket not configured' }, { status: 500 });
    }

    const files: File[] = [];
    for (const [name, val] of form.entries()) {
      if (val instanceof File && (name === 'files' || name === 'file' || name === 'file1' || name === 'file2')) {
        files.push(val);
      }
    }
    if (files.length === 0) {
      return NextResponse.json({ message: '업로드할 파일이 없습니다.' }, { status: 400 });
    }

    const out: { key: string; url: string }[] = [];

    for (const f of files) {
      const buffer = Buffer.from(await f.arrayBuffer());

      const processedImage = await sharp(buffer)
        .resize({
          width: 1600,
          withoutEnlargement: true,
          fit: "inside",
        })
        .webp({ quality: 80, effort: 6, smartSubsample: true, nearLossless: false })
        .toBuffer();

      const originalName = f.name.substring(0, f.name.lastIndexOf('.'));
      const Key = makeObjectKey(`${originalName}.webp`, prefix);

      const uploader = new Upload({
        client: S3client,
        params: {
          Bucket: bucket,          // ✅ 반드시 채워짐
          Key,
          Body: processedImage,
          ContentType: 'image/webp',
        },
        queueSize: 4,
        partSize: 50 * 1024 * 1024,
        leavePartsOnError: false,
      });

      await uploader.done();
      out.push({ key: Key, url: supabasePublicUrl(bucket, Key) });
    }

    return NextResponse.json({
      bucket,
      keys: out.map(o => o.key),
      urls: out.map(o => o.url),
    });
  } catch (e: any) {
    Sentry.captureException(e);
    await notifySlack(e, req.url);
    return NextResponse.json({ message: e?.message ?? '업로드 실패' }, { status: 500 });
  }
}
