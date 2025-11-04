"use client"

import { useState } from 'react';

const items = [
  { label: '거래유형/금액', key: '1' },
  { label: '분양', key: '2' },
  { label: '매매', key: '3' },
  { label: '전세', key: '4' },
  { label: '월세', key: '5' },
];

type SelectedOptionType = typeof items[number]['label']

const LandType = () => {
  const [selectedOption, setSelectedOption] = useState<SelectedOptionType>('거래유형/금액');


  const handleMenuClick = (label: SelectedOptionType) => {
    setSelectedOption(label);
    alert(`Selected: ${label}`);
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
          {items.map((item) => (
            <li
              key={item.key}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleMenuClick(item.label)}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LandType;
