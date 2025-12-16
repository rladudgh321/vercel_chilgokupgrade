"use client"

import Link from "next/link"
import { HeaderProps } from '.'

const OpenMenu = ({ headerPromise, onClose }: { headerPromise: HeaderProps, onClose?: () => void }) => {
  return (
    <ul className="mt-12 space-y-4 text-lg text-gray-700 dark:text-gray-300">
      <li className="border-b border-gray-300 dark:border-gray-700 pb-2">문의전화 <br />{headerPromise.mobile}</li>
      <li className="border-b border-gray-300 dark:border-gray-700 pb-2">
        <Link href="/landSearch" onClick={() => onClose?.()}>매물검색</Link>
      </li>
      <li className="border-b border-gray-300 dark:border-gray-700 pb-2">
        <Link href="/orders" onClick={() => onClose?.()}>매물 의뢰</Link>
      </li>
      <li className="border-b border-gray-300 dark:border-gray-700 pb-2">
        <Link href="/notice" onClick={() => onClose?.()}>공지사항</Link>
      </li>
      <li className="border-b border-gray-300 dark:border-gray-700 pb-2">
        <Link href="/intro" onClick={() => onClose?.()}>회사소개</Link>
      </li>
    </ul>
  )
}

export default OpenMenu
