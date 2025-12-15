
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Pagination from '@/app/components/shared/Pagination';

export type BoardPost = {
  id: number;
  title: string;
  content?: string;
  categoryName?: string;
  createdAt: string;
  registrationDate?: string;
};

const NoticeClient = ({ initialPosts }: { initialPosts: BoardPost[] }) => {
  const router = useRouter();
  const [posts, setPosts] = useState<BoardPost[]>(initialPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const announcements = filteredPosts.filter(p => p.categoryName === '공지');
  const normalPosts = filteredPosts.filter(p => p.categoryName !== '공지');

  const sortedPosts = [...announcements, ...normalPosts];

  const totalPages = Math.ceil(sortedPosts.length / postsPerPage);
  const paginatedPosts = sortedPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const handlePostClick = (id: number) => {
    router.push(`/notice/${id}`);
  };

  return (
    <div className="mx-auto max-w-7xl p-2 sm:p-4 md:p-6 mt-14 bg-white dark:bg-white">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
        <div className="text-lg sm:text-xl font-semibold mb-2 sm:mb-0 text-gray-900 dark:text-gray-900">
          공지사항: {filteredPosts.length}
        </div>
        <div className="flex space-x-2 sm:space-x-4">
                      <input
                        type="text"
                        placeholder="제목 검색"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="p-2 border rounded w-full sm:w-auto placeholder-gray-500 dark:placeholder-gray-500 text-gray-900 dark:text-gray-900 border-gray-300 dark:border-gray-300 bg-white dark:bg-white"
                      />        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-100 dark:bg-gray-100 text-gray-900 dark:text-gray-900">
            <tr>
              <th className="p-2 text-center text-sm sm:text-base">구분</th>
              <th className="p-2 text-center text-sm sm:text-base">제목</th>
              <th className="p-2 text-center text-xs sm:text-sm">등록일</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPosts.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-500 dark:text-gray-500 bg-white dark:bg-white">
                  게시물이 없습니다.
                </td>
              </tr>
            ) : (
              paginatedPosts.map((post, index) => (
                <tr 
                  key={post.id} 
                  className={`${post.categoryName === '공지' ? 'bg-yellow-100 dark:bg-yellow-100' : (index % 2 === 0 ? 'bg-slate-200 dark:bg-slate-200' : 'bg-slate-300 dark:bg-slate-300')} cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-400`}
                  onClick={() => handlePostClick(post.id)}
                >
                  <td className="p-2 text-center text-sm sm:text-base text-gray-900 dark:text-gray-900">
                    {post.categoryName || post.id}
                  </td>
                  <td className="p-2 text-sm sm:text-base text-gray-900 dark:text-gray-900">
                    <div className="max-w-xs truncate" title={post.title}>
                      {post.title}
                    </div>
                  </td>
                  <td className="p-2 text-center text-xs sm:text-sm text-gray-900 dark:text-gray-900">
                    {post.registrationDate
                      ? new Date(post.registrationDate).toLocaleDateString('ko-KR')
                      : new Date(post.createdAt).toLocaleDateString('ko-KR')}
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

export default NoticeClient;
