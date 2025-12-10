import { BuildFindAllAdmin } from '@/app/apis/build';
import ListingsShell, { SortKey } from "./ListingsShell";

const Listings = async ({ searchParams }: { searchParams: Promise<{sortBy: SortKey}> }) => {
  const sortBy = (await searchParams).sortBy;
  const ListingsData = await BuildFindAllAdmin(1, 12, undefined, undefined, sortBy);
  return <ListingsShell ListingsData={ListingsData} sortBy={sortBy} />;
};

export default Listings;
