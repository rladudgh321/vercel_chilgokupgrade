import { useQuery } from "@tanstack/react-query";

interface Request {
  id: number;
  confirm: boolean;
  author: string;
  contact: string;
  ipAddress: string;
  description: string;
  note: string;
  date: string;
}

interface ContactRequestsResponse {
  requests: Request[];
  count: number;
}

export const fetchContactRequests = async (page: number, limit: number): Promise<ContactRequestsResponse> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/supabase/contact-requests?page=${page}&limit=${limit}`, { cache: 'no-store' });
  const json = await res.json();
  if (!json?.ok) throw new Error(json?.error?.message ?? '목록 불러오기 실패');
  return { 
    requests: (json.data as any[]).map((r) => ({
      id: r.id,
      confirm: !!r.confirm,
      author: r.author ?? '',
      contact: r.contact ?? '',
      ipAddress: r.ipAddress ?? '',
      description: r.description ?? '',
      note: r.note ?? '',
      date: r.date ? String(r.date).slice(0, 10) : '',
    })),
    count: json.count ?? 0,
  };
};

export const useContactRequests = (page: number, limit: number) => {
  return useQuery<ContactRequestsResponse, Error>({
    queryKey: ['contactRequests', page, limit],
    queryFn: () => fetchContactRequests(page, limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
    keepPreviousData: true,
  });
};
