'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Pagination from '@/app/components/shared/Pagination';

export type BoardPost = {
  id: number;
  title: string;
  content?: string;
  popupContent?: string;
  representativeImage?: string;
  externalLink?: string;
  registrationDate?: string;
  manager?: string;
  isAnnouncement: boolean;
  isPopup: boolean;
  popupWidth?: number;
  popupHeight?: number;
  isPublished: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
};

const HoverContent = ({ content }: { content?: string }) => {
  if (!content) {
    return null;
  }

  return (
    <div className="relative group">
      <button className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600">
        내용
      </button>
      <div className="absolute bottom-full right-0 mb-2 w-96 max-h-96 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-left text-sm z-10 hidden group-hover:block">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
};


const BoardClient = ({ initialPosts }: { initialPosts: BoardPost[] }) => {
  const router = useRouter();
  const [posts, setPosts] = useState<BoardPost[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);


  const loadPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/board/posts');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '게시글을 불러오는데 실패했습니다');
      }

      setPosts(result.data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // 카테고리와 제목을 기준으로 필터링
  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory === '전체';
    const matchesTitle = post.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesTitle;
  });

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);


  const handleCreatePost = () => {
    router.push('/admin/board/admin-board/create');
  };

  const handleEditPost = (id: number) => {
    router.push(`/admin/board/admin-board/edit/${id}`);
  };

  const handleDeletePost = async (id: number) => {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/board/posts/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '게시글 삭제에 실패했습니다');
      }

      alert('게시글이 삭제되었습니다.');
      loadPosts(); // 목록 새로고침
    } catch (error: unknown) {
      console.error('Error deleting post:', error);
      const errorMessage = error instanceof Error ? error.message : '게시글 삭제에 실패했습니다.';
      alert(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="p-6 dark:bg-gray-800">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg dark:text-gray-200">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 md:p-6 dark:bg-gray-800">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div className="text-lg sm:text-xl font-semibold dark:text-gray-200">
          게시물: {filteredPosts.length}
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          {/* 카테고리 선택 */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 border rounded w-full sm:w-auto dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          >
            <option value="전체">전체</option>
            <option value="공지사항">공지사항</option>
            <option value="뉴스">뉴스</option>
            <option value="이벤트">이벤트</option>
            <option value="FAQ">FAQ</option>
          </select>

          {/* 제목 검색 */}
          <input
            type="text"
            placeholder="제목 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border rounded w-full sm:w-auto dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
          />

          {/* 글쓰기 버튼 */}
          <button 
            onClick={handleCreatePost}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full sm:w-auto dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            글쓰기
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-100 hidden md:table-header-group">
            <tr>
              <th className="p-2 text-center text-xs sm:text-sm">번호</th>
              {/* 카테고리 컬럼 삭제 */}
              <th className="p-2 text-center text-xs sm:text-sm">제목</th>
              <th className="p-2 text-center text-xs sm:text-sm">담당자</th>
              <th className="p-2 text-center text-xs sm:text-sm">등록일</th>
              <th className="p-2 text-center text-xs sm:text-sm">공지 / 일반</th>
              <th className="p-2 text-center text-xs sm:text-sm">팝업여부</th>
              <th className="p-2 text-center text-xs sm:text-sm">게시</th>
              <th className="p-2 text-center text-xs sm:text-sm">비고</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 md:table-row-group">
            {paginatedPosts.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-8 text-center text-gray-500">
                  게시물이 없습니다.
                </td>
              </tr>
            ) : (
              paginatedPosts.map((post, index) => (
                <tr key={post.id} className={`block md:table-row ${index % 2 === 0 ? 'bg-slate-200' : 'bg-slate-300'}`}>
                  <td className="p-2 text-center text-xs sm:text-sm block md:table-cell" data-label="번호">{post.id}</td>
                  <td className="p-2 text-xs sm:text-sm block md:table-cell" data-label="제목">
                    <div className="max-w-xs truncate" title={post.title}>
                      {post.title}
                    </div>
                  </td>
                  <td className="p-2 text-center text-xs sm:text-sm block md:table-cell" data-label="담당자">{post.manager || '미지정'}</td>
                  <td className="p-2 text-center text-xs sm:text-sm block md:table-cell" data-label="등록일">
                    {post.registrationDate 
                      ? new Date(post.registrationDate).toLocaleDateString('ko-KR')
                      : new Date(post.createdAt).toLocaleDateString('ko-KR')
                    }
                  </td>
                  <td className="p-2 text-center block md:table-cell" data-label="공지 / 일반">
                    <span className={`px-2 py-1 rounded text-xs ${
                      post.isAnnouncement 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {post.isAnnouncement ? '공지' : '일반'}
                    </span>
                  </td>
                  <td className="p-2 text-center block md:table-cell" data-label="팝업여부">
                    <span className={`px-2 py-1 rounded text-xs ${
                      post.isPopup 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {post.isPopup ? '팝업' : '일반'}
                    </span>
                  </td>
                  <td className="p-2 text-center block md:table-cell" data-label="게시">
                    <span className={`px-2 py-1 rounded text-xs ${
                      post.isPublished 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {post.isPublished ? '게시' : '비공개'}
                    </span>
                  </td>
                  <td className="p-2 text-center block md:table-cell" data-label="비고">
                    <div className="flex justify-center gap-2">
                      <HoverContent content={post.content} />
                      <button
                        onClick={() => handleEditPost(post.id)}
                        className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center mt-4">
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={setCurrentPage} 
        />
      </div>
    </div>
  );
};

export default BoardClient;
