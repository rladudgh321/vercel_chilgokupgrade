import OrderList from "./OrderList";
import { fetchOrders } from "@/app/hooks/useOrders";
import Hydration from "@/app/components/shared/Hydration";
import { QueryClient, dehydrate } from "@tanstack/react-query";

const OrdersPage = async ({ searchParams }: { searchParams: { page?: string } }) => {
  const page = parseInt(searchParams.page ?? "1", 10);
  const limit = 10;

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['orders', page, limit],
    queryFn: () => fetchOrders(page, limit),
  });
  const dehydratedState = dehydrate(queryClient);

  const { orders, count } = await fetchOrders(page, limit);
  const totalPages = Math.ceil(count / limit);

  return (
    <Hydration state={dehydratedState}>
      <OrderList 
        initialOrders={orders}
        totalPages={totalPages}
        currentPage={page}
      />
    </Hydration>
  );
};

export default OrdersPage;