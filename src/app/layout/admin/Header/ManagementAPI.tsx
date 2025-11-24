'use client'

import { useState, useEffect, useCallback } from 'react'
import styles from './ManagementAPI.module.css'

// --- Plan Limits Configuration ---
const plans = {
  free: {
    db_size: 500 * 1024 * 1024, // 500MB
    storage_size: 1 * 1024 * 1024 * 1024, // 1GB
    // From usage.api-counts, we can use total_rest_requests as a proxy for function invocations/api calls
    // Supabase says API requests are unlimited, but we can set a nominal high number for visualization if needed.
    // For now, we will just display the count for metrics without a hard limit.
    edge_functions: 500000,
    egress: 50 * 1024 * 1024 * 1024, // 50GB
    cached_egress: 100 * 1024 * 1024 * 1024, // 100GB
  },
  pro: {
    db_size: 8 * 1024 * 1024 * 1024, // 8GB
    storage_size: 100 * 1024 * 1024 * 1024, // 100GB
    edge_functions: 2000000,
    egress: 500 * 1024 * 1024 * 1024, // 500GB
    cached_egress: 1000 * 1024 * 1024 * 1024, // 1TB
  },
}

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

const UsageMetric = ({ title, usage, limit, period = '한달' }: { title: string, usage: number, limit: number, period?: string }) => {
  const usagePercent = limit > 0 ? (usage / limit) * 100 : 0;
  const isOverLimit = usagePercent > 100;

  // Determine the display format based on the title
  const isStorage = title.includes('크기') || title.includes('이그레스');
  const displayUsage = isStorage ? formatBytes(usage) : usage.toLocaleString();
  const displayLimit = isStorage ? formatBytes(limit) : limit.toLocaleString();

  return (
    <div className={styles.metric}>
      <div className={styles.metricLabel}>
        <span>{title}</span>
        <span className={isOverLimit ? styles.overLimit : ''}>
          {limit > 0 ? `${displayUsage} / ${period}: ${displayLimit}` : displayUsage}
        </span>
      </div>
      {limit > 0 && (
        <div className={styles.progressBarContainer}>
          <div
            className={`${styles.progressBar} ${isOverLimit ? styles.progressOverLimit : ''}`}
            style={{ width: `${Math.min(usagePercent, 100)}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

// --- Main Component ---
const ManagementAPI = ({ plan = 'free' }: { plan?: 'free' | 'pro' }) => {
  const [usageData, setUsageData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRateLimited, setIsRateLimited] = useState(false)
  console.log('usageData', usageData);
  const currentPlanLimits = plans[plan];

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
  }, [])

  useEffect(() => {
    fetchUsage()
  }, [fetchUsage])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Supabase 사용량 ({plan.toUpperCase()})</h3>
        <button onClick={fetchUsage} disabled={loading || isRateLimited} className={styles.button}>
          새로고침
        </button>
      </div>

      {isRateLimited && <p className={styles.rateLimited}>1분 후 눌러주세요.</p>}
      {loading && <p className={styles.loading}>데이터를 불러오는 중...</p>}
      {error && !isRateLimited && <p className={styles.error}>오류: {error}</p>}
      
      {usageData && !loading && !error && (
        <div>
          <UsageMetric 
            title="데이터베이스 크기"
            usage={usageData.db_size || 0}
            limit={currentPlanLimits.db_size}
            period='총'
          />
          <UsageMetric 
            title="스토리지 크기"
            usage={usageData.storage_size || 0}
            limit={currentPlanLimits.storage_size}
            period='총'
          />
          <UsageMetric 
            title="Edge Function 호출"
            usage={usageData.total_rest_requests || 0} // Using REST as a proxy
            limit={currentPlanLimits.edge_functions}
            period='한달'
          />
          <UsageMetric 
            title="데이터 송출량/이그레스"
            usage={usageData.egress || 0}
            limit={currentPlanLimits.egress}
            period='한달'
          />
          <UsageMetric 
            title="캐시된 이그레스"
            usage={usageData.cached_egress || 0}
            limit={currentPlanLimits.cached_egress}
            period='한달'
          />
        </div>
      )}
    </div>
  )
}

export default ManagementAPI
