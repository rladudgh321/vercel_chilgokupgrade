'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import ToggleSwitch from '@/app/components/admin/listings/ToggleSwitch';
import Pagination from '@/app/components/shared/Pagination';
import IpActions from '@/app/(admin)/shared/IpActions';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type Order = {
  id: number;
  confirm: boolean;
  category: string;
  transactionType: string;
  author: string;
  propertyType: string;
  estimatedAmount: string;
  contact: string;
  ipAddress: string;
  region: string;
  title: string;
  description: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

interface OrderListProps {
  initialOrders: Order[];
  totalPages: number;
  currentPage: number;
}

const OrderList = ({ initialOrders, totalPages, currentPage }: OrderListProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState<'전체' | '구해요' | '팔아요' | '기타'>('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState<{ [key: number]: string }>(
    initialOrders.reduce((acc, order) => {
      if (order.note) {
        acc[order.id] = order.note;
      }
      return acc;
    }, {} as { [key: number]: string })
  );

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Order> }) => {
      const response = await fetch(`/api/inquiries/orders/${id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      alert(error?.message ?? '업데이트 실패');
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/inquiries/orders/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Failed to delete order');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      alert(error?.message ?? '삭제 실패');
    },
  });

  const handleToggleChange = (id: number, value: boolean) => {
    updateOrderMutation.mutate({ id, data: { confirm: value } });
  };

  const handleNoteChange = (id: number, note: string) => {
    setNotes((prev) => ({
      ...prev,
      [id]: note,
    }));
  };

  const handleSaveNote = (id: number) => {
    updateOrderMutation.mutate({ id, data: { note: notes[id] || null } });
  };

  const handleDelete = (id: number) => {
    if (!window.confirm('정말로 이 의뢰를 삭제하시겠습니까?')) {
      return;
    }
    deleteOrderMutation.mutate(id);
  };

  const onPageChange = (page: number) => {
    router.push(`/admin/inquiries/orders?page=${page}`);
  };

  const filteredOrders = useMemo(() => {
    return initialOrders.filter((order) => {
      const matchesCategory = categoryFilter === '전체' || order.category === categoryFilter;
      const matchesSearch = order.contact.includes(searchQuery) || order.title.includes(searchQuery);
      return matchesCategory && matchesSearch;
    });
  }, [initialOrders, categoryFilter, searchQuery]);

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div className="text-lg sm:text-xl font-semibold">
          의뢰수: {filteredOrders.length}건
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as '전체' | '구해요' | '팔아요' | '기타')}
            className="p-2 border rounded w-full sm:w-auto"
          >
            <option value="전체">전체</option>
            <option value="구해요">구해요</option>
            <option value="팔아요">팔아요</option>
          </select>
          <input
            type="text"
            placeholder="연락처 또는 제목 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border rounded w-full sm:w-auto"
          />
          <button
            onClick={() => {}}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full sm:w-auto"
          >
            검색
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-100 hidden md:table-header-group">
            <tr>
              <th className="p-2 text-xs sm:text-sm">번호</th>
              <th className="p-2 text-xs sm:text-sm">확인여부</th>
              <th className="p-2 text-xs sm:text-sm">구분</th>
              <th className="p-2 text-xs sm:text-sm">거래유형</th>
              <th className="p-2 text-xs sm:text-sm">작성자</th>
              <th className="p-2 text-xs sm:text-sm">매물종류</th>
              <th className="p-2 text-xs sm:text-sm">견적금액</th>
              <th className="p-2 text-xs sm:text-sm">연락처</th>
              <th className="p-2 text-xs sm:text-sm">IP주소</th>
              <th className="p-2 text-xs sm:text-sm">의뢰지역</th>
              <th className="p-2 text-xs sm:text-sm">제목</th>
              <th className="p-2 text-xs sm:text-sm">상세내용</th>
              <th className="p-2 text-xs sm:text-sm">등록일</th>
              <th className="p-2 text-xs sm:text-sm">비고</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 md:table-row-group">
            {filteredOrders.map((order, index) => (
              <tr key={order.id} className={`block md:table-row ${index % 2 === 0 ? 'bg-slate-200' : 'bg-slate-300'}`}>
                <td className="p-2 text-xs sm:text-sm block md:table-cell" data-label="번호">{order.id}</td>
                <td className="p-2 block md:table-cell" data-label="확인여부">
                  <ToggleSwitch
                    toggle={order.confirm}
                    id={String(order.id)}
                    onToggle={(value) => handleToggleChange(order.id, value)}
                  />
                </td>
                <td className="p-2 text-xs sm:text-sm block md:table-cell" data-label="구분">{order.category}</td>
                <td className="p-2 text-xs sm:text-sm block md:table-cell" data-label="거래유형">{order.transactionType}</td>
                <td className="p-2 text-xs sm:text-sm block md:table-cell" data-label="작성자">{order.author}</td>
                <td className="p-2 text-xs sm:text-sm block md:table-cell" data-label="매물종류">{order.propertyType}</td>
                <td className="p-2 text-xs sm:text-sm block md:table-cell" data-label="견적금액">{order.estimatedAmount}</td>
                <td className="p-2 text-xs sm:text-sm block md:table-cell" data-label="연락처">{order.contact}</td>
                <td className="p-2 text-xs sm:text-sm block md:table-cell" data-label="IP주소">
                  <IpActions
                    ipAddress={order.ipAddress}
                    contact={order.contact}
                    details={order.description}
                  />
                </td>
                <td className="p-2 text-xs sm:text-sm block md:table-cell" data-label="의뢰지역">{order.region}</td>
                <td className="p-2 text-xs sm:text-sm block md:table-cell" data-label="제목">
                  <p className="border p-2">{order.title}</p>
                  <textarea
                    value={notes[order.id] || ''}
                    onChange={(e) => handleNoteChange(order.id, e.target.value)}
                    placeholder="관리용메모"
                    className="p-2 border rounded w-full mt-2"
                  />
                  <button
                    onClick={() => handleSaveNote(order.id)}
                    className="mt-2 p-2 bg-green-500 text-white rounded hover:bg-green-600 w-full"
                  >
                    메모저장
                  </button>
                </td>
                <td className="p-2 text-xs sm:text-sm block md:table-cell" data-label="상세내용">
                  <button
                    className="p-2 bg-blue-500 text-white rounded w-full"
                    onClick={() => alert(`내용 보기: ${order.description}`)}
                  >
                    내용보기
                  </button>
                </td>
                <td className="p-2 text-xs sm:text-sm block md:table-cell" data-label="등록일">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="p-2 text-xs sm:text-sm block md:table-cell" data-label="비고">
                  <button
                    className="p-2 bg-red-500 text-white rounded w-full"
                    onClick={() => handleDelete(order.id)}
                  >
                    삭제
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

export default OrderList;