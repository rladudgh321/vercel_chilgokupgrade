"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DraggableItem from "./DraggableItem";
import InputWithButton from "./InputWithButton";
import imageCompression from "browser-image-compression";

type ListItem = {
  id: number;
  name: string;
  url?: string;
  imageUrl?: string;
  imageName?: string;
};

type ListManagerProps = {
  title: string;
  placeholder: string;
  buttonText: string;
  apiEndpoint?: string; // ex) '/api/labels'
  enableImageUpload?: boolean;
  enableUrlInput?: boolean;
  imageMaxWidthOrHeight?: number;
};

const ListManager = ({
  title,
  placeholder,
  buttonText,
  apiEndpoint = "",
  enableImageUpload = false,
  enableUrlInput = false,
  imageMaxWidthOrHeight = 300,
}: ListManagerProps) => {
  const queryClient = useQueryClient();

  // 로컬 편집 상태
  const [items, setItems] = useState<ListItem[]>([]);
  const [newItem, setNewItem] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // =========================
  // 1) 리스트 로드 (useQuery)
  // =========================
  const q = useQuery<ListItem[], Error>({
    queryKey: [apiEndpoint],
    enabled: Boolean(apiEndpoint),
    queryFn: async () => {
      const res = await fetch(apiEndpoint);
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error?.message || "데이터를 불러오는데 실패했습니다.");
      }

      // labels API: {id,name} / theme-images API: {id,label,imageUrl,imageName}
      type Row = {
        id: number;
        name?: string;
        label?: string;
        url?: string;
        imageUrl?: string;
        imageName?: string;
      };
      const rows: Row[] = Array.isArray(json.data) ? json.data : [];
      return rows.map((r) => ({
        id: r.id,
        name: (r.label ?? r.name ?? "") as string,
        url: r.url,
        imageUrl: r.imageUrl,
        imageName: r.imageName,
      }));
    },
    staleTime: 60_000,
  });

  // 서버 데이터 -> 로컬 상태 동기화 (실제 변화시에만)
  useEffect(() => {
    if (!q.isSuccess || !q.data) return;

    setItems((prev) => {
      const next = q.data!;
      if (
        prev.length === next.length &&
        prev.every((p, i) => {
          const n = next[i];
          return (
            p.id === n.id &&
            p.name === n.name &&
            p.url === n.url &&
            p.imageUrl === n.imageUrl &&
            p.imageName === n.imageName
          );
        })
      ) {
        return prev; // 변화 없음 → 갱신 불필요
      }
      return next;
    });
  }, [q.isSuccess, q.data]);

  // =========================
  // 2) 순서 저장 (useMutation)
  // =========================
  const saveOrderMutation = useMutation({
    mutationFn: async (orderedIds: number[]) => {
      const res = await fetch(`${apiEndpoint}/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error?.message || "순서 저장에 실패했습니다.");
      }
      return json;
    },
    onError: (err: any) => {
      setLocalError(err?.message || "네트워크 오류가 발생했습니다.");
      // 필요하면 여기에서 이전 순서로 롤백 로직 추가 가능 (onMutate/onError)
    },
  });

  const debouncedSaveOrder = 
    (orderedItems: ListItem[]) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        saveOrderMutation.mutate(orderedItems.map((i) => i.id));
      }, 500);
    };

  // =========================
  // 3) 추가 (이미지 업로드 → POST)
  // =========================
  const addItemMutation = useMutation({
    mutationFn: async (payload: { label: string; url?: string; file?: File }) => {
      let imageUrl: string | undefined;
      let imageName: string | undefined;

      if (enableImageUpload && payload.file) {
        const formData = new FormData();
        formData.append("file", payload.file);
        formData.append("label", payload.label);

        const uploadRes = await fetch(`${apiEndpoint}/upload`, { method: "POST", body: formData });
        const uploadJson = await uploadRes.json().catch(() => ({}));
        if (!uploadRes.ok || !uploadJson?.ok) {
          throw new Error(uploadJson?.error?.message || "이미지 업로드 실패");
        }
        imageUrl = uploadJson?.data?.imageUrl;
        imageName = uploadJson?.data?.imageName;
      }

      const body: { label: string; url?: string; imageUrl?: string; imageName?: string } = {
        label: payload.label,
        url: payload.url,
        imageUrl,
        imageName,
      };

      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error?.message || "추가에 실패했습니다.");
      }
      return json;
    },
    onSuccess: () => {
      setNewItem("");
      setNewUrl("");
      setSelectedFile(null);
      setLocalError(null);
      queryClient.invalidateQueries({ queryKey: [apiEndpoint] });
    },
    onError: (err: any) => setLocalError(err?.message || "네트워크 오류가 발생했습니다."),
  });

  const handleAddItem = () => {
    if (!newItem.trim()) return;
    addItemMutation.mutate({
      label: newItem.trim(),
      url: enableUrlInput ? newUrl.trim() : undefined,
      file: selectedFile || undefined,
    });
  };

  // =========================
  // 4) 수정 (PUT)
  // =========================
  const editItemMutation = useMutation({
    mutationFn: async (data: {
      id: number;
      newName: string;
      newUrl?: string;
      newImageUrl?: string;
      newImageName?: string;
    }) => {
      const body: any = { id: data.id, newName: data.newName };
      if (enableUrlInput) body.newUrl = data.newUrl;
      if (enableImageUpload) {
        body.imageUrl = data.newImageUrl;
        body.imageName = data.newImageName;
      }

      const res = await fetch(apiEndpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error?.message || "수정에 실패했습니다.");
      }
      return json;
    },
    onSuccess: () => {
      setLocalError(null);
      queryClient.invalidateQueries({ queryKey: [apiEndpoint] });
    },
    onError: (err: any) => setLocalError(err?.message || "네트워크 오류가 발생했습니다."),
  });

  const handleEditItem = (id: number, newName: string, newUrl?: string) => {
    editItemMutation.mutate({ id, newName, newUrl });
  };

  // =========================
  // 5) 삭제 (DELETE)
  // =========================
  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${apiEndpoint}?id=${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error?.message || "삭제에 실패했습니다.");
      }
      return json;
    },
    onSuccess: () => {
      setLocalError(null);
      queryClient.invalidateQueries({ queryKey: [apiEndpoint] });
    },
    onError: (err: any) => setLocalError(err?.message || "네트워크 오류가 발생했습니다."),
  });

  const handleDeleteItem = (id: number, name: string) => {
    if (!confirm(`"${name}"을(를) 삭제하시겠습니까?`)) return;
    deleteItemMutation.mutate(id);
  };

  // =========================
  // 6) 드래그 이동 + 디바운스 저장
  // =========================
  const moveItem = (draggedId: number, hoveredId: number) => {
    const draggedIndex = items.findIndex((i) => i.id === draggedId);
    const hoveredIndex = items.findIndex((i) => i.id === hoveredId);
    if (draggedIndex < 0 || hoveredIndex < 0) return;

    const updated = [...items];
    [updated[draggedIndex], updated[hoveredIndex]] = [updated[hoveredIndex], updated[draggedIndex]];
    setItems(updated);
    debouncedSaveOrder(updated);
  };

  // =========================
  // 상태 표시
  // =========================
  const isFetching = q.isLoading;
  const isMutating =
    saveOrderMutation.isPending ||
    addItemMutation.isPending ||
    editItemMutation.isPending ||
    deleteItemMutation.isPending;

  const isLoading = isFetching || isMutating;
  const topError = localError || (q.isError ? (q.error as Error)?.message : null);

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-4 dark:bg-gray-800">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 dark:text-gray-200">{title}</h1>

      {/* Error message */}
      {topError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-300">{topError}</div>
      )}

      {/* Add new item */}
      <InputWithButton
        value={newItem}
        onChange={setNewItem}
        onAdd={handleAddItem}
        placeholder={placeholder}
        buttonText={buttonText}
        disabled={isLoading}
      />

      {/* URL input */}
      {enableUrlInput && (
        <div className="mb-4">
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="URL을 입력하세요"
            className="block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
            disabled={isLoading}
          />
        </div>
      )}

      {/* Image upload */}
      {enableImageUpload && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">이미지 업로드</label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                try {
                  const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: imageMaxWidthOrHeight,
                    useWebWorker: true,
                    fileType: "image/webp",
                    quality: 0.8,
                  };
                  const compressedFile = await imageCompression(file, options);
                  setSelectedFile(compressedFile);
                } catch (error) {
                  console.error(error);
                  setSelectedFile(file);
                }
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:text-gray-300 dark:file:bg-blue-700 dark:file:text-blue-100 dark:hover:file:bg-blue-800"
              disabled={isLoading}
            />
            {selectedFile && <span className="text-sm text-gray-600 dark:text-gray-300">선택됨: {selectedFile.name}</span>}
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="text-center py-4 dark:text-gray-300">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2">처리 중...</span>
        </div>
      )}

      {/* Item list */}
      <div className="space-y-2">
        {items.map((item) => (
          <DraggableItem
            key={item.id}
            id={item.id}
            name={item.name}
            url={item.url}
            imageUrl={item.imageUrl}
            imageName={item.imageName}
            moveItem={moveItem}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
            onImageEdit={enableImageUpload ? (id, newImageUrl, newImageName) => editItemMutation.mutate({
              id,
              newName: items.find((it) => it.id === id)?.name || "",
              newImageUrl,
              newImageName,
            }) : undefined}
            uploadEndpoint={enableImageUpload ? `${apiEndpoint}/upload` : undefined}
            imageMaxWidthOrHeight={imageMaxWidthOrHeight}
            disabled={isLoading}
          />
        ))}
      </div>

      {/* Empty state */}
      {!isLoading && items.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">등록된 항목이 없습니다.</div>
      )}
    </div>
  );
};

export default ListManager;
