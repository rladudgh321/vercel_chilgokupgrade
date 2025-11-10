'use client'

import { useState, useEffect, useCallback } from 'react'
import styles from './ManagementAPI.module.css'

// --- Plan Limits Configuration ---
const plans = {
  free: {
    bandwidth: 100 * 1024 * 1024 * 1024, // 100 GB
  },
  pro: {
    bandwidth: 1 * 1024 * 1024 * 1024 * 1024, // 1 TB
  },
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (!isFinite(bytes) || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const num = bytes / Math.pow(k, i);

  if (sizes[i] === 'GB' || sizes[i] === 'TB') {
    return `${parseFloat(num.toFixed(3))} ${sizes[i]}`;
  }
  
  const dm = decimals < 0 ? 0 : decimals;
  return `${parseFloat(num.toFixed(dm))} ${sizes[i]}`;
};

const UsageMetric = ({ title, usage, limit, period = '한달' }: { title: string, usage: number, limit: number, period?: string }) => {
  const usagePercent = limit > 0 ? (usage / limit) * 100 : 0;
  const isOverLimit = usagePercent > 100;

  const displayUsage = formatBytes(usage);
  const displayLimit = formatBytes(limit);

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

const VercelUsage = ({ plan = 'free' }: { plan?: 'free' | 'pro' }) => {
  const [usageData, setUsageData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRateLimited, setIsRateLimited] = useState(false)

  const currentPlanLimits = plans[plan];

  const fetchUsage = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/vercel-usage')
      if (response.status === 429) {
        setIsRateLimited(true)
        setTimeout(() => setIsRateLimited(false), 60000)
        throw new Error('Rate limited. 1분 후 시도해 주세요.')
      }
      const data = await response.json()
      if (!response.ok) {
        // 서버에서 보낸 상세 정보를 최대한 표시
        const detail = data?.error || JSON.stringify(data);
        throw new Error(detail || 'Failed to fetch usage data.')
      }
      setUsageData(data)
    } catch (err: any) {
      setError(err?.message || String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsage()
  }, [fetchUsage])

  // usageData 구조가 불확실하므로 여러 경로를 시도
  const getBandwidth = (data: any) => {
    if (!data) return 0;

    // 여러 API 응답 스키마에 대비
    // 1) data.bandwidth.{rx,tx}
    const rx = Number(data?.bandwidth?.rx ?? data?.usage?.bandwidth?.rx ?? data?.bandwidthRx ?? 0);
    const tx = Number(data?.bandwidth?.tx ?? data?.usage?.bandwidth?.tx ?? data?.bandwidthTx ?? 0);
    const total = (isFinite(rx) ? rx : 0) + (isFinite(tx) ? tx : 0);

    // 2) 어떤 응답은 bytes 단위가 아닌 경우가 있을 수 있으므로 확인 필요(확실하지 않음)
    return total;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Vercel 사용량 ({plan.toUpperCase()})</h3>
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
            title="데이터 대역폭"
            usage={getBandwidth(usageData)}
            limit={currentPlanLimits.bandwidth}
            period='한달'
          />

          {/* 디버깅용: 원시 응답 보기(개발 중에만 활성화하세요) */}
          <details style={{ marginTop: 12 }}>
            <summary>원시 응답(JSON)</summary>
            <pre style={{ maxHeight: 300, overflow: 'auto' }}>
              {JSON.stringify(usageData, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  )
}

export default VercelUsage
