'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

interface AccessLog {
  id: number;
  ip: string;
  browser: string;
  os: string;
  referrer: string;
  location: string;
  createdAt: string;
}

export default function AccessLogsPage() {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/admin/access-logs');
        if (response.ok) {
          const data = await response.json();
          setLogs(data);
        } else {
          const errorData = await response.json();
          setError(`Error fetching logs: ${errorData.error || response.statusText}`);
        }
      } catch (error: any) {
        console.error('Error fetching access logs:', error);
        setError(`Error fetching logs: ${error.message}`);
      }
      setLoading(false);
    };

    fetchLogs();
  }, []);

  const formatInKoreanTime = (dateString: string) => {
    try {
      const utcDate = new Date(dateString);
      const kstDate = toZonedTime(utcDate, 'Asia/Seoul');
      return format(kstDate, 'yyyy-MM-dd HH:mm:ss');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  return (
    <div className="container mx-auto p-4 dark:bg-gray-800">
      <h1 className="text-2xl font-bold mb-4 dark:text-gray-200">접속 기록</h1>
      {loading && <p className="dark:text-gray-300">Loading...</p>}
      {error && <p className="text-red-500 dark:text-red-400">{error}</p>}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="py-2 px-4 border-b dark:border-gray-600">번호</th>
                <th className="py-2 px-4 border-b dark:border-gray-600">아이피</th>
                <th className="py-2 px-4 border-b dark:border-gray-600">브라우저</th>
                <th className="py-2 px-4 border-b dark:border-gray-600">운영체제</th>
                <th className="py-2 px-4 border-b dark:border-gray-600">직전 URL</th>
                <th className="py-2 px-4 border-b dark:border-gray-600">접속 위치</th>
                <th className="py-2 px-4 border-b dark:border-gray-600">접속 시간</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 dark:text-gray-400">No access logs found.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-2 px-4 border-b text-center dark:border-gray-700">{log.id}</td>
                    <td className="py-2 px-4 border-b text-center dark:border-gray-700">{log.ip}</td>
                    <td className="py-2 px-4 border-b text-center dark:border-gray-700">{log.browser}</td>
                    <td className="py-2 px-4 border-b text-center dark:border-gray-700">{log.os}</td>
                    <td className="py-2 px-4 border-b text-center dark:border-gray-700">{log.referrer}</td>
                    <td className="py-2 px-4 border-b text-center dark:border-gray-700">{log.location}</td>
                    <td className="py-2 px-4 border-b text-center dark:border-gray-700">
                      {formatInKoreanTime(log.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}