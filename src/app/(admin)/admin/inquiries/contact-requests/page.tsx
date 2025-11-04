import ContactRequestList from "./ContactRequestList";
import { fetchContactRequests } from "@/app/hooks/useContactRequests";
import Hydration from "@/app/components/shared/Hydration";
import { QueryClient, dehydrate } from "@tanstack/react-query";

const ContactRequestPage = async ({ searchParams }: { searchParams: Promise<{ page?: string }> }) => {
  const page = parseInt((await searchParams).page ?? "1", 10);
  const limit = 10;

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['contactRequests', page, limit],
    queryFn: () => fetchContactRequests(page, limit),
  });
  const dehydratedState = dehydrate(queryClient);

  const { requests, count } = await fetchContactRequests(page, limit);
  const totalPages = Math.ceil(count / limit);

  return (
    <Hydration state={dehydratedState}>
      <ContactRequestList 
        initialRequests={requests}
        totalPages={totalPages}
        currentPage={page}
      />
    </Hydration>
  );
};

export default ContactRequestPage;