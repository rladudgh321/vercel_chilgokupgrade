
import { POST } from './route';
import { NextRequest } from 'next/server';
import { Upload } from '@aws-sdk/lib-storage';
import { supabasePublicUrl, makeObjectKey } from '@/app/api/supabase/S3';

// S3 및 Upload 라이브러리 모의(mock) 설정
jest.mock('@aws-sdk/lib-storage');
jest.mock('@/app/api/supabase/S3', () => ({
  S3client: jest.fn(), // Upload 생성자에 필요
  supabasePublicUrl: jest.fn((bucket, key) => `http://mock.url/${bucket}/${key}`),
  makeObjectKey: jest.fn((filename, prefix) => `${prefix}/${filename}`),
  PUBLIC_BUCKET: 'test-bucket',
}));

describe('/api/image/uploads API 라우트', () => {
  let mockUploadDone: jest.Mock;

  beforeEach(() => {
    // 각 테스트 전에 모의 함수 호출 기록을 초기화합니다.
    mockUploadDone = jest.fn().mockResolvedValue({});
    jest.spyOn(Upload.prototype, 'done').mockImplementation(mockUploadDone);
    (supabasePublicUrl as jest.Mock).mockClear();
    (makeObjectKey as jest.Mock).mockClear();
  });

  describe('POST 핸들러', () => {
    test('여러 파일을 성공적으로 업로드해야 합니다.', async () => {
      // 모의 파일 생성
      const file1 = new File(['content1'], 'test1.jpg', { type: 'image/jpeg' });
      const file2 = new File(['content2'], 'test2.png', { type: 'image/png' });
      const formData = new FormData();
      formData.append('files', file1);
      formData.append('files', file2);

      const req = new NextRequest('http://localhost', { 
        method: 'POST', 
        body: formData 
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(Upload).toHaveBeenCalledTimes(2);
      expect(mockUploadDone).toHaveBeenCalledTimes(2);
      expect(body.urls).toHaveLength(2);
      expect(body.urls[0]).toBe('http://mock.url/test-bucket/sub/test1.jpg');
      expect(body.urls[1]).toBe('http://mock.url/test-bucket/sub/test2.png');
    });

    test('업로드할 파일이 없으면 400 에러를 반환해야 합니다.', async () => {
      const formData = new FormData();
      const req = new NextRequest('http://localhost', { 
        method: 'POST', 
        body: formData 
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.message).toBe('업로드할 파일이 없습니다.');
      expect(Upload).not.toHaveBeenCalled();
    });

    test('업로드 중 하나라도 실패하면 500 에러를 반환해야 합니다.', async () => {
      const file1 = new File(['content1'], 'good.jpg');
      const file2 = new File(['content2'], 'bad.jpg');
      const formData = new FormData();
      formData.append('files', file1);
      formData.append('files', file2);

      // 두 번째 업로드에서 에러 발생 시뮬레이션
      const uploadError = new Error('Multipart Upload Failed');
      let callCount = 0;
      mockUploadDone.mockImplementation(() => {
        callCount++;
        if (callCount > 1) {
          return Promise.reject(uploadError);
        }
        return Promise.resolve({});
      });

      const req = new NextRequest('http://localhost', { 
        method: 'POST', 
        body: formData 
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.message).toBe('Multipart Upload Failed');
      expect(Upload).toHaveBeenCalledTimes(2); // 두 번의 업로드를 시도함
      expect(mockUploadDone).toHaveBeenCalledTimes(2);
    });
  });
});
