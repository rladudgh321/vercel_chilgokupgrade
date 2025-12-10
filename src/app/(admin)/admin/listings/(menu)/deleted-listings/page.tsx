import { BuildFindAllDeleted } from "@/app/apis/build";
import DeletedShell from "./DeletedShell";

const DeletedListingsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ page: string }>;
}) => {
  const page = (await searchParams).page ? parseInt((await searchParams).page, 10) : 1;
  const DeletedData = await BuildFindAllDeleted(page);
  return <DeletedShell DeletedData={DeletedData} />;
};

export default DeletedListingsPage;
