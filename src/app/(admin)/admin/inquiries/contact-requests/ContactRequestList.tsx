'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ToggleSwitch from '@/app/components/admin/listings/ToggleSwitch';
import Pagination from '@/app/components/shared/Pagination';
import IpActions from '@/app/(admin)/shared/IpActions';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchContactRequests } from '@/app/hooks/useContactRequests';

type Request = {
  id: number;
  confirm: boolean;
  author: string;
  contact: string;
  ipAddress: string;
  description: string;
  note: string;
  date: string;
};

interface ContactRequestListProps {
  initialRequests: Request[];
  totalPages: number;
  currentPage: number;
}

const ContactRequestList = ({ initialRequests, totalPages, currentPage }: ContactRequestListProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: queryData } = useQuery({
    queryKey: ['contactRequests', currentPage],
    queryFn: () => fetchContactRequests(currentPage, 10),
    initialData: { requests: initialRequests, count: totalPages * 10 },
  });

  const requests = queryData?.requests || [];

  const [notes, setNotes] = useState<{ [key: number]: string }>(
    requests.reduce((acc, r) => {
      acc[r.id] = r.note;
      return acc;
    }, {} as { [key: number]: string })
  );

  useEffect(() => {
    setNotes(
      requests.reduce((acc, r) => {
        acc[r.id] = r.note;
        return acc;
      }, {} as { [key: number]: string })
    );
  }, [requests]);

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Request> }) => {
      const res = await fetch('/api/supabase/contact-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });
      if (!res.ok) throw new Error('업데이트 실패');
      return res.json();
    },
    onMutate: () => setIsUpdating(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactRequests'] });
    },
    onError: (error) => {
      alert(error?.message ?? '업데이트 실패');
    },
    onSettled: () => setIsUpdating(false),
  });

  const deleteRequestMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/supabase/contact-requests?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('삭제 실패');
      if (res.status === 204) return null;
      return res.json();
    },
    onMutate: () => setIsUpdating(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactRequests'] });
    },
    onError: (error) => {
      alert(error?.message ?? '삭제 실패');
    },
    onSettled: () => setIsUpdating(false),
  });

  const handleToggleChange = (id: string, value: boolean) => {
    const numericId = parseInt(id, 10);
    updateRequestMutation.mutate({ id: numericId, data: { confirm: value } });
  };

  const handleNoteChange = (id: number, note: string) => {
    setNotes((prev) => ({
      ...prev,
      [id]: note,
    }));
  };

  const handleSaveNote = (id: number) => {
    const note = notes[id] ?? '';
    updateRequestMutation.mutate({ id, data: { note } });
  };

  const handleDelete = (id: number) => {
    const confirmDelete = window.confirm('정말로 삭제하시겠습니까?');
    if (!confirmDelete) return;
    deleteRequestMutation.mutate(id);
  };

  const filteredRequests = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return requests;
    return requests.filter((request) => request.contact.includes(q) || request.description.includes(q));
  }, [requests, searchQuery]);

  const onPageChange = (page: number) => {
    router.push(`/admin/inquiries/contact-requests?page=${page}`);
  };

  return (
    <div className={`p-2 sm:p-4 md:p-6 ${isUpdating ? 'cursor-wait' : ''}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div className="text-lg sm:text-xl font-semibold">
          의뢰수: {filteredRequests.length}건
        </div>
        <div className="flex space-x-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="연락처, 상세내용 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border rounded w-full"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-100 hidden md:table-header-group">
            <tr>
              <th className="p-2 text-xs sm:text-sm">번호</th>
              <th className="p-2 text-xs sm:text-sm">확인여부</th>
              <th className="p-2 text-xs sm:text-sm">이름</th>
              <th className="p-2 text-xs sm:text-sm">연락처</th>
              <th className="p-2 text-xs sm:text-sm">IP</th>
              <th className="p-2 text-xs sm:text-sm">상세내용</th>
              <th className="p-2 text-xs sm:text-sm">관리용메모</th>
              <th className="p-2 text-xs sm:text-sm">등록일</th>
              <th className="p-2 text-xs sm:text-sm">비고</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 md:table-row-group">
            {filteredRequests.map((request, index) => (
              <tr key={request.id} className={`block md:table-row ${index % 2 === 0 ? 'bg-slate-200' : 'bg-slate-300'}`}>
                <td className="p-2 text-xs sm:text-sm block md:table-cell" data-label="번호">{request.id}</td>
                <td className="p-2 block md:table-cell" data-label="확인여부">
                  <ToggleSwitch
                    toggle={request.confirm}
                    id={`confirm${request.id}`}
                    onToggle={(checked) => handleToggleChange(String(request.id), checked)}
                    disabled={updateRequestMutation.isPending}
                  />
                </td>
                <td className="p-2 text-xs sm:text-sm block md:table-cell" data-label="이름">{request.author}</td>
                <td className="p-2 text-xs sm:text-sm block md:table-cell" data-label="연락처">{request.contact}</td>
                <td className="p-2 text-xs sm:text-sm block md:table-cell" data-label="IP">
                  <IpActions
                    ipAddress={request.ipAddress}
                    contact={request.contact}
                    details={request.description}
                  />
                </td>
                <td className="p-2 text-xs sm:text-sm block md:table-cell" data-label="상세내용">{request.description}</td>
                <td className="p-2 block md:table-cell" data-label="관리용메모">
                  <textarea
                    value={notes[request.id] ?? ''}
                    onChange={(e) => handleNoteChange(request.id, e.target.value)}
                    placeholder="관리용메모"
                    className="p-2 border rounded w-full mt-2 text-xs sm:text-sm"
                  />
                  <button
                    onClick={() => handleSaveNote(request.id)}
                    className="mt-2 p-2 bg-green-500 text-white rounded hover:bg-green-600 w-full disabled:bg-gray-400"
                    disabled={updateRequestMutation.isPending}
                  >
                    메모저장
                  </button>
                </td>
                <td className="p-2 text-xs sm:text-sm block md:table-cell" data-label="등록일">{request.date}</td>
                <td className="p-2 block md:table-cell" data-label="비고">
                  <button
                    className="p-2 bg-red-500 text-white rounded w-full disabled:bg-gray-400"
                    onClick={() => handleDelete(request.id)}
                    disabled={deleteRequestMutation.isPending}
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

export default ContactRequestList;
