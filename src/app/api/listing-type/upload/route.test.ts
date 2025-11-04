
import { POST } from './route';
import { NextRequest } from 'next/server';
import { S3client, supabasePublicUrl, makeObjectKey } from '@/app/api/supabase/S3';

// S3 관련 함수들 모의(mock) 설정
jest.mock('@/app/api/supabase/S3', () => ({
  S3client: {
    send: jest.fn(),
  },
  supabasePublicUrl: jest.fn((bucket, key) => `http://mock.url/${bucket}/${key}`),
  makeObjectKey: jest.fn((filename, prefix) => `${prefix}/${filename}`),
  PUBLIC_BUCKET: 'test-bucket',
}));

describe('/api/listing-type/upload API 라우트', () => {
  beforeEach(() => {
    (S3client.send as jest.Mock).mockClear();
  });

  describe('POST 핸들러', () => {
    test('파일과 라벨을 포함하여 성공적으로 업로드해야 합니다.', async () => {
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const label = '아파트';
      const formData = new FormData();
      formData.append('file', file);
      formData.append('label', label);

      (S3client.send as jest.Mock).mockResolvedValue({});

      const req = new NextRequest('http://localhost', { method: 'POST', body: formData });
      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.ok).toBe(true);
      expect(body.data.label).toBe(label);
      expect(body.data.imageUrl).toContain('listing-type/test.png');
      expect(S3client.send).toHaveBeenCalledTimes(1);
    });

    test('file 필드가 없으면 400 에러를 반환해야 합니다.', async () => {
      const formData = new FormData();
      formData.append('label', '아파트');
      const req = new NextRequest('http://localhost', { method: 'POST', body: formData });
      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error.message).toBe('file 필드가 필요합니다.');
    });

    test('label 필드가 없으면 400 에러를 반환해야 합니다.', async () => {
        const formData = new FormData();
        formData.append('file', new File(['test'], 'test.png'));
        const req = new NextRequest('http://localhost', { method: 'POST', body: formData });
        const response = await POST(req);
        const body = await response.json();
  
        expect(response.status).toBe(400);
        expect(body.error.message).toBe('라벨이 필요합니다.');
      });

    test('S3 업로드 실패 시 500 에러를 반환해야 합니다.', async () => {
        const formData = new FormData();
        formData.append('file', new File(['test'], 'test.png'));
        formData.append('label', '아파트');

        (S3client.send as jest.Mock).mockRejectedValue(new Error('S3 Error'));

        const req = new NextRequest('http://localhost', { method: 'POST', body: formData });
        const response = await POST(req);
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.error.message).toBe('S3 Error');
    });
  });
});
