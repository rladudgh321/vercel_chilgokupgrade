import { BuildFindAllAdmin } from '@/app/apis/build';
import ListingsShell from "./ListingsShell";

const Listings = async () => {
  const ListingsData = await BuildFindAllAdmin();
  return <ListingsShell ListingsData={ListingsData} />;
};

export default Listings;
