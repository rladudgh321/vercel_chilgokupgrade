import { IWorkInfo } from "@/app/interface/workinfo";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

export async function WorkInfoFindOne(): Promise<{ ok: boolean; data: IWorkInfo; error?: any }> {
  const res = await fetch(`${baseURL}/api/workinfo`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GET /api/workinfo failed (${res.status}): ${text}`);
  }
  return res.json();
}
