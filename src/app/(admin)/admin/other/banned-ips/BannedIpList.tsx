'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Pagination from '@/app/components/shared/Pagination';

type BannedIp = {
  id: number;
  ipAddress: string;
  contact: string | null;
  details: string | null;
  createdAt: string;
};

interface BannedIpListProps {
  initialBannedIps: BannedIp[];
  totalPages: number;
  currentPage: number;
}

const BannedIpList = ({ initialBannedIps, totalPages, currentPage }: BannedIpListProps) => {
  const router = useRouter();
  const [bannedIps, setBannedIps] = useState<BannedIp[]>(initialBannedIps);
  const [searchQuery, setSearchQuery] = useState('');
  console.log('bannedIps', bannedIps)
  const handleUnban = async (id: number) => {
    if (!window.confirm('정말로 이 IP를 차단 해제하시겠습니까?')) {
      return;
    }

    try {
      // We need a new API endpoint to delete from BannedIp table
      const res = await fetch(`/api/admin/banned-ips/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('차단 해제 실패');
      
      alert('차단이 해제되었습니다.');
      setBannedIps((prev) => prev.filter((ip) => ip.id !== id));
    } catch (e) {
      alert((e as Error)?.message ?? '차단 해제 실패');
    }
  };

  const filteredBannedIps = () => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return bannedIps;
    return bannedIps.filter((ip) => 
      ip.ipAddress.toLowerCase().includes(q) ||
      ip.contact?.toLowerCase().includes(q) ||
      ip.details?.toLowerCase().includes(q)
    );
  }

  const onPageChange = (page: number) => {
    router.push(`/admin/other/banned-ips?page=${page}`);
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 dark:bg-gray-800">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div className="text-lg sm:text-xl font-semibold dark:text-gray-200">
          차단된 IP 수: {filteredBannedIps().length}건
        </div>
        <div className="flex space-x-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="IP, 연락처, 상세내용 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse dark:text-gray-300">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="p-2 text-xs sm:text-sm dark:text-gray-200">ID</th>
              <th className="p-2 text-xs sm:text-sm dark:text-gray-200">차단 IP주소</th>
              <th className="p-2 text-xs sm:text-sm dark:text-gray-200">연락처</th>
              <th className="p-2 text-xs sm:text-sm dark:text-gray-200">상세내용</th>
              <th className="p-2 text-xs sm:text-sm dark:text-gray-200">등록일</th>
              <th className="p-2 text-xs sm:text-sm dark:text-gray-200">비고</th>
            </tr>
          </thead>
          <tbody>
            {filteredBannedIps().map((ip, index) => (
              <tr key={ip.id} className={index % 2 === 0 ? 'bg-slate-200 dark:bg-gray-900' : 'bg-slate-300 dark:bg-gray-800'}>
                <td className="p-2 text-xs sm:text-sm">{ip.id}</td>
                <td className="p-2 text-xs sm:text-sm">{ip.ipAddress}</td>
                <td className="p-2 text-xs sm:text-sm">{ip.contact}</td>
                <td className="p-2 text-xs sm:text-sm">{ip.details}</td>
                <td className="p-2 text-xs sm:text-sm">{new Date(ip.createdAt).toLocaleString()}</td>
                <td className="p-2">
                  <button
                    className="p-2 bg-red-500 text-white rounded w-full dark:bg-red-700 dark:hover:bg-red-800"
                    onClick={() => handleUnban(ip.id)}
                  >
                    차단해제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default BannedIpList;
