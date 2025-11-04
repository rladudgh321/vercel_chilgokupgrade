import { PUT, DELETE } from './route';
import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Mock the Supabase client
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('/api/board/posts/[id]', () => {
  let supabase: any;

  beforeEach(() => {
    supabase = {
      from: jest.fn(() => supabase),
      update: jest.fn(() => supabase),
      delete: jest.fn(() => supabase),
      eq: jest.fn(() => supabase),
      select: jest.fn(() => supabase),
      single: jest.fn(),
    };
    (createClient as jest.Mock).mockReturnValue(supabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('PUT', () => {
    const postId = '1';
    const updateData = { title: 'Updated Title', content: 'Updated content' };

    it('should update a post successfully', async () => {
      const updatedPost = { id: postId, ...updateData };
      supabase.single.mockResolvedValue({ data: updatedPost, error: null });

      const req = new NextRequest(`http://localhost/api/board/posts/${postId}`,
        {
          method: 'PUT',
          body: JSON.stringify(updateData),
        }
      );

      const response = await PUT(req, { params: { id: postId } });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.message).toBe('게시글이 성공적으로 수정되었습니다');
      expect(body.data).toEqual(updatedPost);
      expect(supabase.eq).toHaveBeenCalledWith('id', postId);
    });

    it('should return 400 for invalid update data', async () => {
        const req = new NextRequest(`http://localhost/api/board/posts/${postId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ content: 'only content' }), // Missing title
        }
      );

      const response = await PUT(req, { params: { id: postId } });
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.message).toBe('입력 데이터가 올바르지 않습니다');
    });

    it('should return 500 on database error', async () => {
        supabase.single.mockResolvedValue({ data: null, error: { message: 'DB Error' } });
  
        const req = new NextRequest(`http://localhost/api/board/posts/${postId}`,
        {
          method: 'PUT',
          body: JSON.stringify(updateData),
        }
      );
  
        const response = await PUT(req, { params: { id: postId } });
        const body = await response.json();
  
        expect(response.status).toBe(500);
        expect(body.message).toBe('DB Error');
      });
  });

  describe('DELETE', () => {
    const postId = '1';

    it('should delete a post successfully', async () => {
        supabase.eq.mockResolvedValue({ error: null }); // .delete() does not return data
  
        const req = new NextRequest(`http://localhost/api/board/posts/${postId}`, { method: 'DELETE' });
        const response = await DELETE(req, { params: { id: postId } });
        const body = await response.json();
  
        expect(response.status).toBe(200);
        expect(body.message).toBe('게시글이 성공적으로 삭제되었습니다');
        expect(supabase.delete).toHaveBeenCalled();
        expect(supabase.eq).toHaveBeenCalledWith('id', postId);
      });

      it('should return 500 on database error', async () => {
        supabase.eq.mockResolvedValue({ error: { message: 'DB Error' } });
  
        const req = new NextRequest(`http://localhost/api/board/posts/${postId}`, { method: 'DELETE' });
        const response = await DELETE(req, { params: { id: postId } });
        const body = await response.json();
  
        expect(response.status).toBe(500);
        expect(body.message).toBe('DB Error');
      });
  });
});