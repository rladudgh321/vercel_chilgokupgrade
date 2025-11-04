'use client';

import { useState, useEffect } from "react";
import Pagination from "@/app/components/shared/Pagination";

interface AccessLog {
  id: number;
  ip: string | null;
  browser: string | null;
  os: string | null;
  referrer: string | null;
  location: string | null;
  createdAt: string;
}

const AccessLogList = () => {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const limit = 10;

  useEffect(() => {
    const fetchLogs = async () => {
      const res = await fetch(`/api/admin/other/access-logs?page=${page}&limit=${limit}`);
      const { data, count } = await res.json();
      setLogs(data);
      setCount(count);
    };
    fetchLogs();
  }, [page]);

  const totalPages = Math.ceil(count / limit);

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>접속 기록</h1>
      <table className='min-w-full table-auto border-collapse'>
        <thead>
          <tr>
            <th className='border px-4 py-2'>번호</th>
            <th className='border px-4 py-2'>아이피</th>
            <th className='border px-4 py-2'>브라우저</th>
            <th className='border px-4 py-2'>운영체제</th>
            <th className='border px-4 py-2'>직전 URL</th>
            <th className='border px-4 py-2'>위치</th>
            <th className='border px-4 py-2'>접속시간</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td className='border px-4 py-2'>{log.id}</td>
              <td className='border px-4 py-2'>{log.ip}</td>
              <td className='border px-4 py-2'>{log.browser}</td>
              <td className='border px-4 py-2'>{log.os}</td>
              <td className='border px-4 py-2'>{log.referrer}</td>
              <td className='border px-4 py-2'>{log.location}</td>
              <td className='border px-4 py-2'>{new Date(log.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination
        totalPages={totalPages}
        currentPage={page}
        onPageChange={setPage}
      />
    </div>
  );
};

export default AccessLogList;
