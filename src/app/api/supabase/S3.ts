import { S3Client } from '@aws-sdk/client-s3';

export const S3client = new S3Client({
  forcePathStyle: true,
  region: 'ap-northeast-2',
  endpoint: 'https://pijtsbicrnsbdaewosgt.storage.supabase.co/storage/v1/s3',
  credentials: {
    accessKeyId: process.env.ACCESSKEY_ID!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  }
})

export const PUBLIC_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_BUCKET!; // 예: 'build-images'

export const supabasePublicUrl = (bucket: string, key: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${key}`;

export const makeObjectKey = (originalName: string, prefix = 'main') => {
  const safe = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${prefix}/${Date.now()}_${Math.random().toString(36).slice(2)}_${safe}`;
};