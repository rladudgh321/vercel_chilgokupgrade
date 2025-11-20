'use client'

import { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const VercelUsage = () => {
  const envProjectId = process.env.NEXT_PUBLIC_VERCEL_PROJECT_ID;
  console.log('envProjectId', envProjectId);

  // 해당 월의 1일과 마지막일 계산
  const getDefaultDates = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return { firstDay, lastDay }
  }

  const { firstDay, lastDay } = getDefaultDates()

  const [fromDate, setFromDate] = useState<Date>(firstDay)
  const [toDate, setToDate] = useState<Date>(lastDay)

  const handleOpenVercelUsage = () => {
    if (!envProjectId) {
      alert('Project ID가 설정되지 않았습니다.')
      return
    }

    const fromTimestamp = fromDate.getTime()
    const toTimestamp = toDate.getTime()

    const url = `https://vercel.com/rladudgh321s-projects/~/usage?projectId=${encodeURIComponent(
      envProjectId
    )}&from=${fromTimestamp}&to=${toTimestamp}`

    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Vercel Usage 확인</h3>
      <div className="flex gap-4 mb-4">
        <div className="flex flex-col">
          <label className="mb-1 font-medium">시작일:</label>
          <DatePicker
            selected={fromDate}
            onChange={(date: Date) => setFromDate(date)}
            dateFormat="yyyy-MM-dd"
            className="border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 font-medium">종료일:</label>
          <DatePicker
            selected={toDate}
            onChange={(date: Date) => setToDate(date)}
            dateFormat="yyyy-MM-dd"
            className="border border-gray-300 rounded px-3 py-2"
          />
        </div>
      </div>
      <button
        onClick={handleOpenVercelUsage}
        className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition-colors"
      >
        이동하기
      </button>
    </div>
  )
}

export default VercelUsage
