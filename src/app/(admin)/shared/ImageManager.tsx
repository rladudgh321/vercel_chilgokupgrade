"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
import DraggableItem from './DraggableItem';
import imageCompression from "browser-image-compression";

type ImageManagerProps = {
  title: string;
  apiEndpoint?: string;
  imageMaxWidthOrHeight?: number;
};

const ImageManager = ({ title, apiEndpoint = '', imageMaxWidthOrHeight = 1920 }: ImageManagerProps) => {
  const [items, setItems] = useState<{ id: number; name: string; url?: string; imageUrl?: string; imageName?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const handleSaveOrder = async (orderedItems: typeof items) => {
    try {
      const orderedIds = orderedItems.map(item => item.id);
      const response = await fetch(`${apiEndpoint}/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderedIds }),
      });

      const result = await response.json();

      if (result.ok) {
        setError(null);
      } else {
        setError(result.error?.message || '순서 저장에 실패했습니다.');
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    }
  };

  const debouncedSaveOrder = (orderedItems: typeof items) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      handleSaveOrder(orderedItems);
    }, 500); // 500ms delay
  };


  // 데이터 로드
  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(apiEndpoint);
      const result = await response.json();
      
      if (result.ok) {
        type Row = { id: number; name?: string; label?: string; url?: string; imageUrl?: string; imageName?: string };
        const rows: Row[] = Array.isArray(result.data) ? result.data : [];
        const normalized = rows.map((r: Row) => {
          const name = r.label || r.name || '';
          return { id: r.id, name: name as string, url: r.url, imageUrl: r.imageUrl, imageName: r.imageName };
        });
        setItems(normalized);
        setError(null);
      } else {
        setError(result.error?.message || '데이터를 불러오는데 실패했습니다.');
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleAddItem = async () => {
    if (!selectedFile) return;

    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      const uploadUrl = `${apiEndpoint}/upload`;
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.ok) {
        const saveRes = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl: result.data.imageUrl,
            imageName: result.data.imageName,
          }),
        });
        const saveJson = await saveRes.json();
        if (saveJson.ok) {
          setSelectedFile(null);
          await loadItems();
          setError(null);
        } else {
          setError(saveJson.error?.message || '이미지 정보 저장에 실패했습니다.');
        }
      } else {
        setError(result.error?.message || '추가에 실패했습니다.');
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageEdit = async (id: number, newImageUrl: string, newImageName: string) => {
    try {
      setLoading(true);
      const response = await fetch(apiEndpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          imageUrl: newImageUrl,
          imageName: newImageName,
        }),
      });

      const result = await response.json();

      if (result.ok) {
        await loadItems();
        setError(null);
      } else {
        setError(result.error?.message || '이미지 수정에 실패했습니다.');
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const moveItem = (draggedId: number, hoveredId: number) => {
    const draggedIndex = items.findIndex((item) => item.id === draggedId);
    const hoveredIndex = items.findIndex((item) => item.id === hoveredId);
    const updatedItems = [...items];

    [updatedItems[draggedIndex], updatedItems[hoveredIndex]] = [
      updatedItems[hoveredIndex],
      updatedItems[draggedIndex],
    ];
    setItems(updatedItems);
    debouncedSaveOrder(updatedItems);
  };

  const handleDeleteItem = async (id: number, name: string) => {
    if (!confirm(`"${name || '이 이미지'}"을(를) 삭제하시겠습니까?`)) return;

    try {
      setLoading(true);
      const response = await fetch(`${apiEndpoint}?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.ok) {
        await loadItems(); // 데이터 다시 로드
        setError(null);
      } else {
        setError(result.error?.message || '삭제에 실패했습니다.');
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4">{title}</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          이미지 업로드
        </label>
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
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={loading}
          />
          {selectedFile && (
            <button onClick={handleAddItem} className="px-4 py-2 bg-blue-500 text-white rounded-md" disabled={loading}>
              업로드
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2">처리 중...</span>
        </div>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <DraggableItem
            key={item.id}
            id={item.id}
            name={item.name}
            imageUrl={item.imageUrl}
            imageName={item.imageName}
            moveItem={moveItem}
            onDelete={handleDeleteItem}
            onImageEdit={handleImageEdit}
            uploadEndpoint={`${apiEndpoint}/upload`}
            disabled={loading}
          />
        ))}
      </div>

      {!loading && items.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          등록된 항목이 없습니다.
        </div>
      )}
    </div>
  );
};

export default ImageManager;
