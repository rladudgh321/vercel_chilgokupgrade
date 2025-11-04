import { POST, GET } from './route';
import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Mock the Supabase client
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('/api/board/posts', () => {
  let supabase: any;

  beforeEach(() => {
    supabase = {
      from: jest.fn(() => supabase),
      insert: jest.fn(() => supabase),
      select: jest.fn(() => supabase),
      single: jest.fn(),
      order: jest.fn(() => supabase),
      range: jest.fn(),
      eq: jest.fn(() => supabase),
    };
    (createClient as jest.Mock).mockReturnValue(supabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('should create a post successfully', async () => {
      const mockPost = { title: 'Test Post', content: 'Test content' };
      const createdPost = { id: 1, ...mockPost };
      supabase.single.mockResolvedValue({ data: createdPost, error: null });

      const req = new NextRequest('http://localhost/api/board/posts', {
        method: 'POST',
        body: JSON.stringify(mockPost),
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toBe('게시글이 성공적으로 생성되었습니다');
      expect(body.data).toEqual(createdPost);
    });

    it('should return 400 for invalid data', async () => {
      const req = new NextRequest('http://localhost/api/board/posts', {
        method: 'POST',
        body: JSON.stringify({ content: 'only content' }), // Missing title
      });

      const response = await POST(req);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.message).toBe('입력 데이터가 올바르지 않습니다');
    });

    it('should return 500 on database error', async () => {
        const mockPost = { title: 'Test Post', content: 'Test content' };
        supabase.single.mockResolvedValue({ data: null, error: { message: 'DB Error' } });
  
        const req = new NextRequest('http://localhost/api/board/posts', {
          method: 'POST',
          body: JSON.stringify(mockPost),
        });
  
        const response = await POST(req);
        const body = await response.json();
  
        expect(response.status).toBe(500);
        expect(body.message).toBe('DB Error');
      });
  });

  describe('GET', () => {
    it('should fetch posts with pagination', async () => {
      const mockPosts = [{ id: 1, title: 'Post 1' }];
      supabase.range.mockResolvedValue({ data: mockPosts, error: null, count: 1 });

      const req = new NextRequest('http://localhost/api/board/posts?page=1&limit=10');
      const response = await GET(req);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data).toEqual(mockPosts);
      expect(body.count).toBe(1);
      expect(supabase.range).toHaveBeenCalledWith(0, 9);
    });

    it('should filter by publishedOnly', async () => {
        supabase.range.mockResolvedValue({ data: [], error: null, count: 0 });
  
        const req = new NextRequest('http://localhost/api/board/posts?publishedOnly=true');
        await GET(req);
  
        expect(supabase.eq).toHaveBeenCalledWith('isPublished', true);
      });
  });
});
