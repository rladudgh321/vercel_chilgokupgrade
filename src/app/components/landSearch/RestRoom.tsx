"use client"

import { useState } from 'react';

const RestRoom = () => {
  const [selectedOption, setSelectedOption] = useState('화장실');

  const items = [
    { label: '화장실', key: '0' },
    { label: '화장실 1개', key: '1' },
    { label: '화장실 2개', key: '2' },
    { label: '화장실 3개', key: '3' },
    { label: '화장실 4개', key: '4' },
    { label: '화장실 5개', key: '5' },
    { label: '화장실 6개', key: '6' },
  ];

  const handleMenuClick = (label: typeof items[number]['label']) => {
    setSelectedOption(label);
    console.log(`Selected: ${label}`);
  };

  return (
    <div className="relative">
      <button className="flex items-center space-x-2 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
        <span>{selectedOption}</span>
        v
      </button>

      {/* Dropdown menu */}
      <div className="absolute left-0 mt-2 w-full bg-white border rounded-md shadow-lg">
        <ul className="space-y-2 p-2">
          {items.map(({key, label}) => (
            <li
              key={key}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleMenuClick(label)}
            >
              {label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RestRoom;
