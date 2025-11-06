const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

export interface Paginated<T> {
  ok: boolean;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  data: T[];
}

export type Build = Record<string, any>;

export async function BuildFindAll(
  page: number = 1,
  limit: number = 12,
  keyword?: string,
  filters?: { theme?: string; propertyType?: string; buyType?: string; rooms?: string; bathrooms?: string; popularity?: string },
  sortBy?: string,
  opts?: { signal?: AbortSignal }
) {
  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(keyword?.trim() ? { keyword: keyword.trim() } : {}),
    ...(filters?.theme ? { theme: filters.theme } : {}),
    ...(filters?.propertyType ? { propertyType: filters.propertyType } : {}),
    ...(filters?.buyType ? { buyType: filters.buyType } : {}),
    ...(filters?.rooms ? { rooms: filters.rooms } : {}),
    ...(filters?.bathrooms ? { bathrooms: filters.bathrooms } : {}),
    ...(filters?.popularity ? { popularity: filters.popularity } : {}),
    ...(sortBy ? { sortBy: sortBy } : {}),
  });

  const res = await fetch(`${baseURL}/api/supabase/build?${qs.toString()}`, {
    method: "GET",
    signal: opts?.signal,
    next: { revalidate: 28800, tags: ['public', 'admin-listings']}
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GET /api/supabase/build failed (${res.status}): ${text}`);
  }
  return res.json();
}

export async function BuildFindAllAdmin(
  page: number = 1,
  limit: number = 12,
  keyword?: string,
  filters?: { theme?: string; propertyType?: string; buyType?: string; rooms?: string; bathrooms?: string },
  sortBy?: string,
  opts?: { signal?: AbortSignal }
) {
  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(keyword?.trim() ? { keyword: keyword.trim() } : {}),
    ...(filters?.theme ? { theme: filters.theme } : {}),
    ...(filters?.propertyType ? { propertyType: filters.propertyType } : {}),
    ...(filters?.buyType ? { buyType: filters.buyType } : {}),
    ...(filters?.rooms ? { rooms: filters.rooms } : {}),
    ...(filters?.bathrooms ? { bathrooms: filters.bathrooms } : {}),
    ...(sortBy ? { sortBy: sortBy } : {}),
  });

  const res = await fetch(`${baseURL}/api/supabase/build?${qs.toString()}`, {
    method: "GET",
    signal: opts?.signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GET /api/supabase/build failed (${res.status}): ${text}`);
  }
  return res.json();
}

export async function BuildCreate(data: object){
  const res = await fetch(`${baseURL}/api/supabase/build`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
		body : JSON.stringify(data),
  });
  if (res.status === 204) {
    console.log("body 없음")
  } else if (!res.headers.get("content-type")?.includes("application/json")) {
    const text = await res.text(); // JSON 아님 → 내용 확인
    throw new Error(`Non-JSON response: ${text.slice(0,200)}...`);
  } else {
    const json = await res.json();
    console.log(json);
  }
}

// 삭제 취소(복원): deletedAt → null
export async function BuildRestore(id: number, opts?: { signal?: AbortSignal }) {
  const res = await fetch(`${baseURL}/api/supabase/build/${id}/restore`, {
    method: "PUT",
    signal: opts?.signal,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message ?? "복원 실패");
  return json as { message: string; restoredId: number; restoredAt: string };
}

// 영구 삭제(물리 삭제)
export async function BuildHardDelete(id: number, opts?: { signal?: AbortSignal }) {
  const res = await fetch(`${baseURL}/api/supabase/build/${id}/hard`, {
    method: "DELETE",
    signal: opts?.signal,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message ?? "영구 삭제 실패");
  return json as { message: string; deletedId: number };
}

export async function BuildFindOne(id: number) {
  const url = `${baseURL}/api/supabase/build/${id}`;
  console.log(`Fetching build data from: ${url}`);
  try {
    const res = await fetch(url, { method: "GET", next: {
      revalidate: 28800, tags: ['public', 'admin-build-id']
    } });
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`API Error: ${res.status} ${res.statusText}`, errorText);
      throw new Error(`GET ${url} 실패: ${res.status} ${res.statusText}`);
    }
    return res.json(); // 서버가 단일 객체를 반환한다고 가정
  } catch (error) {
    console.error('Fetch failed for BuildFindOne:', error);
    throw error;
  }
}

export async function BuildUpdate(id: number, data: object) {
  const res = await fetch(`${baseURL}/api/supabase/build/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`PATCH /api/supabase/build/${id} 실패: ${txt}`);
  }
  return res.json();
}

// apis/build.ts (또는 apis/image.ts로 분리 권장)
export const uploadImage = async (formData: FormData) => {
  const res = await fetch(`${baseURL}/api/image/upload`, { method: "POST", body: formData });
  if (!res.ok) throw new Error("대표 사진 업로드 실패");
  return res.json(); // { url }
};

export const uploadImages = async (formData: FormData) => {
  const res = await fetch(`${baseURL}/api/image/uploads`, { method: "POST", body: formData });
  if (!res.ok) throw new Error("사진들 업로드 실패");
  return res.json(); // { urls: [] }
};


export async function BuildDeleteSome(ids: number[], opts?: { signal?: AbortSignal }) {
  const res = await fetch(`${baseURL}/api/supabase/build/some`, {
    method: 'DELETE',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
    signal: opts?.signal,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message ?? "deleteBuildSome 실패");
  return json as { message: string; deletedCount: number; deletedIds: number[]; deletedAt: string };
}

// 삭제된 매물 모두 보기
export async function BuildFindAllDeleted(
  page: number = 1,
  limit: number = 12,
  keyword?: string,
  opts?: { signal?: AbortSignal }
) {
  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    status: "deleted",                                // 👈 핵심
    ...(keyword?.trim() ? { keyword: keyword.trim() } : {}),
  });

  const res = await fetch(`${baseURL}/api/supabase/build/delete?${qs.toString()}`, {
    method: "GET",
    signal: opts?.signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GET /api/supabase/build?status=deleted failed (${res.status}): ${text}`);
  }
  return res.json();
}

export async function toggleBuild(id: number, visibility?: boolean, opts?: { signal?: AbortSignal }) {
  const body = visibility === undefined ? {} : { visibility };
  const res = await fetch(`${baseURL}/api/supabase/build/${id}/toggle`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    signal: opts?.signal,
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message ?? "토글 실패");
  return json as { message: string; id: number; visibility: boolean };
}

export async function updateAddressVisibility(
  id: number,
  payload: { isAddressPublic: "public" | "private" | "exclude" },
  opts?: { signal?: AbortSignal }
) {
  const res = await fetch(`${baseURL}/api/supabase/build/${id}/address-visibility`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    signal: opts?.signal,
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message ?? "주소 공개여부 업데이트 실패");
  return json as { message: string; id: number; isAddressPublic: "public" | "private" | "exclude" };
}

export async function updateConfirmDate(
  id: number,
  payload: { confirmDate: string | null },
  opts?: { signal?: AbortSignal }
) {
  const res = await fetch(`${baseURL}/api/supabase/build/${id}/confirm-date`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    signal: opts?.signal,
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message ?? "현장 확인일 업데이트 실패");
  return json as { message: string; id: number; confirmDate: string | null };
}

export async function patchConfirmDateToToday(
  id: number,
  opts?: { signal?: AbortSignal }
) {
  const res = await fetch(`${baseURL}/api/supabase/build/${id}/confirm-date`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    signal: opts?.signal,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message ?? "현장 확인일 갱신 실패");
  return json as { message: string; id: number; confirmDate: string };
}