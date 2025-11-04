"use client"

import React, { useState } from 'react';

const Theme = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const [selectedItem, setSelectedItem] = useState('테마');

  const items = [
    { label: '테마', key: '0' },
    { label: '반려동물', key: '1' },
    { label: '저보증금 원룸', key: '2' },
    { label: '전세 자금 대출', key: '3' },
    { label: '복층', key: '4' },
    { label: '주차가능', key: '5' },
    { label: '옥탑', key: '6' },
    { label: '역세권', key: '7' },
    { label: '신축', key: '8' },
  ];

  const handleItemClick = (label: typeof items[number]['label']) => {
    setSelectedItem(label);
    setOpenMenu(false);
  };

  return (
    <div className="relative">
      {/* Button */}
      <button
        onClick={() => setOpenMenu(!openMenu)}
        className="px-4 py-2 bg-blue-500 text-white rounded-md flex items-center space-x-2 hover:bg-blue-600"
      >
        <span>{selectedItem}</span>
        v
      </button>

      {/* Dropdown Menu */}
      {openMenu && (
        <div className="absolute left-0 mt-2 w-40 bg-white border border-gray-300 rounded-lg shadow-lg">
          <ul className="py-1">
            {items.map((item) => (
              <li
                key={item.key}
                onClick={() => handleItemClick(item.label)}
                className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
              >
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Theme;
