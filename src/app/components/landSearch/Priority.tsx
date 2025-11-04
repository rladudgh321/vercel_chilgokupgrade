"use client"

import { clsx } from 'clsx';
import { useState } from 'react';

type Item = '최신순' | '인기순' | '추천순' | '금액순' | '면적순';

const priorityData = ['최신순', '인기순', '금액순', '면적순'];

const Priority = () => {
  const [selected, setSelected] = useState<Item>('최신순');

  const handleClick = (option: Item) => {
    setSelected(option);
    console.log(`Selected: ${option}`);
  };

  return (
    <div className="text-center">
      <div className="flex justify-center space-x-2 w-full">
        {priorityData.map((option) => (
          <button
            key={option}
            onClick={() => handleClick(option as Item)}
            className={clsx(
              'flex-1 py-2 px-4 rounded-md text-sm font-medium',
              selected === option
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700',
              'hover:bg-blue-300'
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Priority;
