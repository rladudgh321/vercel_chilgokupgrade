import { BuildFindAllDeleted } from "@/app/apis/build";
import DeletedShell from "./DeletedShell";

const DeletedListingsPage = async () => {
  const DeletedData = await BuildFindAllDeleted();
  return <DeletedShell DeletedData={DeletedData} />;
};

export default DeletedListingsPage;
