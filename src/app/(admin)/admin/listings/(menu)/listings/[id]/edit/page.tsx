import EditClient from "./EditClient";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const idNum = Number(id);

  if (!Number.isInteger(idNum) || idNum <= 0) {
    return <div>잘못된 매물 ID</div>;
  }

  return <EditClient id={idNum} />;
}
