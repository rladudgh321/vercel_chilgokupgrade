"use client";

import { useState } from 'react';
import ListManager from "@adminShared/ListManager";

const OptionsSettings = () => {
  const [activeTab, setActiveTab] = useState('building');

  const tabs = [
    { id: 'building', label: '건물 옵션', apiEndpoint: '/api/building-options' },
    { id: 'room', label: '방 옵션', apiEndpoint: '/api/room-options' },
    { id: 'bathroom', label: '화장실 옵션', apiEndpoint: '/api/bathroom-options' },
    { id: 'floor', label: '층 옵션', apiEndpoint: '/api/floor-options' },
  ];

  return (
    <div className="p-2 sm:p-4">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="pt-4">
        {tabs.map((tab) => (
          <div key={tab.id} className={activeTab === tab.id ? '' : 'hidden'}>
            <ListManager
              title={tab.label}
              placeholder={`새로운 ${tab.label}`}
              buttonText={`${tab.label} 등록`}
              apiEndpoint={tab.apiEndpoint}
              enableImageUpload={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default OptionsSettings;
