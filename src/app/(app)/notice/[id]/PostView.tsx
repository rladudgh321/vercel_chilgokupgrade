'use client';

import Link from 'next/link';
import { use } from 'react';

export type BoardPost = {
  id: number;
  title: string;
  content?: string;
  createdAt: string;          // ISO
  registrationDate?: string;  // ISO
};

const dateFmt = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });

export default function PostView({ postPromise }: { postPromise: Promise<BoardPost> }) {
  const post = use(postPromise);

  const displayDate = () => {
    const iso = post.registrationDate || post.createdAt;
    return dateFmt.format(new Date(iso));
  }

  return (
    <div className="p-4 sm:p-6 mt-16">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">{post.title}</h1>

          <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center text-sm text-gray-600 mb-6">
            <span>등록일: {displayDate()}</span>
          </div>

          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content || '' }}
          />
        </div>

        <div className="p-4 bg-gray-50 text-right">
          <Link href="/notice" className="px-3 py-1 sm:px-4 sm:py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
            목록으로
          </Link>
        </div>
      </div>
    </div>
  );
}
