import { useQuery } from "@tanstack/react-query";

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

interface OrdersResponse {
  orders: Order[];
  count: number;
}

export const fetchOrders = async (page: number, limit: number): Promise<OrdersResponse> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/inquiries/orders?page=${page}&limit=${limit}`, { cache: 'no-store' });
  const json = await res.json();
  if (json.error) throw new Error(json.error ?? '목록 불러오기 실패');
  return { 
    orders: json.data as any[],
    count: json.count ?? 0,
  };
};

export const useOrders = (page: number, limit: number) => {
  return useQuery<OrdersResponse, Error>({
    queryKey: ['orders', page, limit],
    queryFn: () => fetchOrders(page, limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
    keepPreviousData: true,
  });
};
