// app/components/BoardMenu.js
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface IBoardProps {
  title: string;
  url: string;
}

const BoardMenu = ({data}: {data: IBoardProps[]}) => {
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <ul className="space-y-2 pl-4 mt-2">
      {
        data.map(({title, url}) => (
        <li key={url}>
          <button
            onClick={() => handleNavigation(`/admin/board/${url}`)}
            className="w-full text-left hover:bg-gray-700 p-2 rounded-md"
          >
            {title}
          </button>
        </li>
        ))
      }
    </ul>
  );
};

export default BoardMenu;
