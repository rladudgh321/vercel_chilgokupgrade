"use client"

import React, { useState } from 'react'
import Image from 'next/image';
import Link from 'next/link';

const Header_Button = ({
  children,
  logoUrl,
  companyName,
  logoName,
}: {
  children: React.ReactNode;
  logoUrl?: string;
  companyName?: string;
  logoName?: string;
}) => {
  const [menu, setMenu] = useState(false);

  const onToggleMenuBtn = () => {
    setMenu((prev) => !prev);
  };

  const onCloseMenu = () => {
    setMenu(false);
  };

  const renderLogoAndBrand = () => {
    const style = logoName?.split('#')[1] || 'both';
    const showLogo = style === 'logo_only' || style === 'both';
    const showBrand = style === 'brand_only' || style === 'both';

    return (
      <Link href="/" className="mb-5 flex items-center gap-2" aria-label="홈으로" onClick={onCloseMenu}>
        {showLogo && logoUrl && (
          <div className="relative h-8 w-28">
            <Image
              alt="logo"
              src={logoUrl}
              fill
              priority
              sizes="112px"
              className="object-contain"
            />
          </div>
        )}
        {showBrand && companyName && (
          <span className="text-lg font-semibold dark:text-white">{companyName}</span>
        )}
      </Link>
    );
  };

  return (
    <>
      <button
        onClick={onToggleMenuBtn}
        className="text-lg px-3 py-1 rounded-md shadow-sm border border-gray-400 bg-white hover:bg-gray-100 dark:bg-slate-900 dark:text-white dark:border-slate-700 dark:hover:bg-slate-800"
      >
        ☰
      </button>

      {menu && (
        <>
          <div className="fixed top-0 left-0 w-[75vw] h-screen bg-white dark:bg-slate-900 shadow-md border-r border-gray-300 dark:border-slate-700 p-5 z-50 flex flex-col">
            <button
              onClick={onToggleMenuBtn}
              className="absolute top-3 right-3 text-2xl dark:text-white"
            >
              ✖
            </button>
            {renderLogoAndBrand()}
            {/* 자식에게 onCloseMenu 전달 */}
            {React.cloneElement(
              children as React.ReactElement<{ onClose?: () => void }>,
              { onClose: onCloseMenu }
            )}
          </div>

          <div 
            onClick={onToggleMenuBtn} 
            className="fixed top-0 right-0 w-[25vw] h-screen bg-black bg-opacity-30 z-40"
          />
        </>
      )}
    </>
  )
}

export default Header_Button
