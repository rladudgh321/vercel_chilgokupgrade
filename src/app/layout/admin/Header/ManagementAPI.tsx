'use client'

import { useState, useEffect, useCallback } from 'react'

// --- Helper Components & Functions ---
const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const num = bytes / Math.pow(k, i);

  if (sizes[i] === 'GB') {
    return `${parseFloat(num.toFixed(3))} ${sizes[i]}`;
  }
  
  const dm = decimals < 0 ? 0 : decimals;
  return `${parseFloat(num.toFixed(dm))} ${sizes[i]}`;
};

const UsageMetric = ({ title, usage, limit }: { title: string, usage: number, limit: number }) => {
  const usagePercent = limit > 0 ? (usage / limit) * 100 : 0;
  const isOverLimit = usagePercent > 100;

  const displayUsage = formatBytes(usage);
  const displayLimit = formatBytes(limit);

  return (
    <div className="mb-3">
      <div className="text-sm text-gray-800 mb-1 flex justify-between">
        <span>{title}</span>
        <span className={isOverLimit ? "text-red-700 font-semibold" : ''}>
          {limit > 0 ? `${displayUsage} / 총: ${displayLimit}` : displayUsage}
        </span>
      </div>
      {limit > 0 && (
        <div className="w-full bg-gray-200 rounded h-2.5 overflow-hidden">
          <div
            className={`h-full bg-blue-600 rounded transition-width duration-500 ease-in-out ${isOverLimit ? "bg-red-700" : ''}`}
            style={{ width: `${Math.min(usagePercent, 100)}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

// --- Main Component ---
const ManagementAPI = () => {
  const [usageData, setUsageData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRateLimited, setIsRateLimited] = useState(false)


  const fetchUsage = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/supabase-usage')
      if (response.status === 429) {
        setIsRateLimited(true)
        setTimeout(() => setIsRateLimited(false), 60000)
        throw new Error('1분 후 눌러주세요.')
      }
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch usage data.')
      }
      setUsageData(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, []);

  useEffect(() => {
    fetchUsage()
  }, [fetchUsage])

  return (
    <div className="bg-gray-50 rounded-lg p-4 shadow-md max-w-sm m-4 font-sans">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Supabase 사용량</h3>
        <button 
          onClick={fetchUsage} 
          disabled={loading || isRateLimited} 
          className="bg-blue-600 text-white border-none rounded-md py-2 px-3 cursor-pointer text-sm transition-colors duration-200 hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          새로고침
        </button>
      </div>

      {isRateLimited && <p className="text-red-600 text-sm text-center mb-2.5">1분 후 눌러주세요.</p>}
      {loading && <p className="text-center p-5 text-base text-gray-600">데이터를 불러오는 중...</p>}
      {error && !isRateLimited && <p className="text-center p-5 text-base text-gray-600">오류: {error}</p>}
      
      {usageData && !loading && !error && (
        <div>
          <UsageMetric 
            title="데이터베이스 크기"
            usage={usageData.db_size || 0}
            limit={500 * 1024 * 1024} // 500MB (Free plan limit)
          />
          <UsageMetric 
            title="스토리지 크기"
            usage={usageData.storage_size || 0}
            limit={1 * 1024 * 1024 * 1024} // 1GB (Free plan limit)
          />
          <div className="mt-5 text-center">
            <a 
              href={`https://supabase.com/dashboard/org/zsnwfomrrcqueeucsnfl/usage`}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 no-underline font-medium text-base transition-colors duration-200 hover:text-blue-800 hover:underline"
            >
              추가 사용량 확인
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManagementAPI
