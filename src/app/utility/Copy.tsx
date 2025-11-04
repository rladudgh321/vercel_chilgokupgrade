'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function CopyText({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (err) {
      console.error('복사 실패:', err)
    }
  }

  return (
    <div className="px-4 py-2 hover:bg-gray-100 rounded-md">
      <button
        onClick={handleCopy}
        className="text-gray-500 hover:text-gray-800 transition flex gap-x-2 cursor-pointer"
        aria-label="Copy to clipboard"
      >
        <span className="select-all text-sm text-gray-800">{text}</span>
        {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
      </button>
    </div>
  )
}
