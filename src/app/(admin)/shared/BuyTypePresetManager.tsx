"use client"

import { useState, useEffect } from 'react';
import PricePresetManager from './PricePresetManager';

type BuyType = {
  id: number;
  name: string;
};

const BuyTypePresetManager = () => {
  const [buyTypes, setBuyTypes] = useState<BuyType[]>([]);
  const [selectedBuyType, setSelectedBuyType] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBuyTypes = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/buy-types');
        const result = await response.json();
        if (result.ok) {
          setBuyTypes(result.data);
          if (result.data.length > 0) {
            setSelectedBuyType(result.data[0].id);
          }
        } else {
          setError(result.error?.message || '거래 유형을 불러오는데 실패했습니다.');
        }
      } catch {
        setError('네트워크 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    loadBuyTypes();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4">금액 관리</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="buy-type-select" className="block text-sm font-medium text-gray-700 dark: text-slate-100">거래 유형</label>
        <select
          id="buy-type-select"
          value={selectedBuyType ?? ''}
          onChange={(e) => setSelectedBuyType(parseInt(e.target.value))}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          disabled={loading}
        >
          {buyTypes.map((bt) => (
            <option key={bt.id} value={bt.id}>
              {bt.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading...</p>}

      {selectedBuyType && !loading && (
        <PricePresetManager buyTypeId={selectedBuyType} />
      )}
    </div>
  );
};

export default BuyTypePresetManager;
