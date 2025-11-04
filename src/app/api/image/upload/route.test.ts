import { POST } from './route';
import { NextRequest } from 'next/server';
import { S3client } from '@/app/api/supabase/S3';
import { PutObjectCommand } from '@aws-sdk/client-s3';

// Mock the S3 client and helper functions
jest.mock('@/app/api/supabase/S3', () => ({
  S3client: {
    send: jest.fn(),
  },
  PUBLIC_BUCKET: 'test-bucket',
  supabasePublicUrl: jest.fn((bucket, key) => `https://test.com/${bucket}/${key}`),
  makeObjectKey: jest.fn((name, prefix) => `${prefix}/${name}`),
}));

describe('POST /api/image/upload', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if no file is provided', async () => {
    const formData = new FormData();
    const req = new NextRequest('http://localhost/api/image/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe('file 필드가 필요합니다.');
  });

  it('should return 500 on S3 upload error', async () => {
    const file = new File(['test content'], 'test.png', { type: 'image/png' });
    const formData = new FormData();
    formData.append('file', file);

    (S3client.send as jest.Mock).mockRejectedValue(new Error('S3 Error'));

    const req = new NextRequest('http://localhost/api/image/upload', {
        method: 'POST',
        body: formData,
      });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toBe('S3 Error');
  });

  it('should upload a file successfully', async () => {
    const file = new File(['test content'], 'test.png', { type: 'image/png' });
    const formData = new FormData();
    formData.append('file', file);
    formData.append('prefix', 'test-prefix');

    (S3client.send as jest.Mock).mockResolvedValue({});

    const req = new NextRequest('http://localhost/api/image/upload', {
        method: 'POST',
        body: formData,
      });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(S3client.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
    expect(body.key).toBe('test-prefix/test.png');
    expect(body.url).toContain('test-prefix/test.png');
  });
});