"use client"

import { useState, useEffect, useCallback, useRef } from 'react';
import DraggableItem from './DraggableItem';
import InputWithButton from './InputWithButton';

type Preset = {
  id: number;
  name: string;
};

type PricePresetManagerProps = {
    buyTypeId: number;
};

const PricePresetManager = ({ buyTypeId }: PricePresetManagerProps) => {
  const [items, setItems] = useState<Preset[]>([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const apiEndpoint = `/api/price-presets`;

  const handleSaveOrder = useCallback(async (orderedItems: Preset[]) => {
    try {
      const response = await fetch(`${apiEndpoint}/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderedItems.map((item, index) => ({ id: item.id, order: index }))),
      });

      const result = await response.json();

      if (!result.ok) {
        setError(result.error?.message || '순서 저장에 실패했습니다.');
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    }
  }, [apiEndpoint]);

  const debouncedSaveOrder = useCallback((orderedItems: Preset[]) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      handleSaveOrder(orderedItems);
    }, 500);
  }, [handleSaveOrder]);


  const loadItems = useCallback(async () => {
    if (!buyTypeId) return;
    try {
      setLoading(true);
      const response = await fetch(`${apiEndpoint}?buyTypeId=${buyTypeId}`);
      const result = await response.json();
      
      if (result.ok) {
        setItems(result.data);
        setError(null);
      } else {
        setError(result.error?.message || '데이터를 불러오는데 실패했습니다.');
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [buyTypeId, apiEndpoint]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleAddItem = async () => {
    if (!newItem.trim()) return;

    try {
      setLoading(true);
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newItem.trim(), buyTypeId }),
      });

      const result = await response.json();
      
      if (result.ok) {
        setNewItem('');
        await loadItems();
        setError(null);
      } else {
        setError(result.error?.message || '추가에 실패했습니다.');
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

  const handleEditItem = async (id: number, newName: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${apiEndpoint}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      });

      const result = await response.json();
      
      if (result.ok) {
        await loadItems();
        setError(null);
      } else {
        setError(result.error?.message || '수정에 실패했습니다.');
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: number, name: string) => {
    if (!confirm(`"${name}"을(를) 삭제하시겠습니까?`)) return;

    try {
      setLoading(true);
      const response = await fetch(`${apiEndpoint}/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.ok) {
        await loadItems();
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
    <div className="p-2 sm:p-4 border rounded-lg mt-4">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <InputWithButton
        value={newItem}
        onChange={setNewItem}
        onAdd={handleAddItem}
        placeholder="새로운 금액"
        buttonText="금액 등록"
        disabled={loading}
      />

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2">처리 중...</span>
        </div>
      )}

      <div className="space-y-2 mt-4">
        {items.map((item) => (
          <DraggableItem
            key={item.id}
            id={item.id}
            name={item.name}
            moveItem={moveItem}
            onEdit={(oldName, newName) => handleEditItem(item.id, newName)}
            onDelete={() => handleDeleteItem(item.id, item.name)}
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

export default PricePresetManager;
