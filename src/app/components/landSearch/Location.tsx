"use client"

import { useState } from 'react';
const Location = () => {
  const [showMore] = useState(false);
  return (
    <div className="p-4">
      <div className="text-lg mb-4">위치</div>
      <div className="mb-4">
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded-md"
        >
          경북 칠곡군
        </button>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <select
            className="border p-2 rounded-md w-full"
          >
          </select>
        </div>

        {showMore && (
          <div className="flex-1">
            <select
              className="border p-2 rounded-md w-full"
            >
            </select>
          </div>
        )}
      </div>

      <div className="mt-4">
        <input
          placeholder="상세주소"
          className="border p-2 rounded-md w-full"
        />
      </div>
    </div>
  );
};

export default Location;
