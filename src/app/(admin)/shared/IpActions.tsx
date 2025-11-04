'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface IpActionsProps {
  ipAddress: string;
  contact: string;
  details: string;
}

const IpActions = ({ ipAddress, contact, details }: IpActionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleBan = async (deleteAll: boolean) => {
    const confirmMessage = deleteAll
      ? `다음 IP를 차단하고 모든 관련 항목을 삭제하시겠습니까?\nIP: ${ipAddress}`
      : `다음 IP를 차단하시겠습니까?\nIP: ${ipAddress}`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/banned-ips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ipAddress,
          contact,
          details,
          deleteAll,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'IP 처리 실패');
      }

      alert('작업이 성공적으로 완료되었습니다.');
      router.refresh();
    } catch (error) {
      console.error('Error processing IP action:', error);
      alert((error as Error).message || '작업 중 오류가 발생했습니다.');
    }
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-2 py-1 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          id="options-menu"
          aria-haspopup="true"
          aria-expanded="true"
          onClick={() => setIsOpen(!isOpen)}
        >
          {ipAddress}
          <svg className="-mr-1 ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
        >
          <div className="py-1" role="none">
            <button
              onClick={() => handleBan(false)}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              role="menuitem"
            >
              해당 항목 IP 차단
            </button>
            <button
              onClick={() => handleBan(true)}
              className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100 hover:text-red-900"
              role="menuitem"
            >
              해당 IP 차단 및 전체항목 삭제
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IpActions;
