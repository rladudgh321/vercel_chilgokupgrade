"use client"

import React, { useState } from 'react'

const Header_Button = ({children}: {children: React.ReactNode}) => {
  const [menu, setMenu] = useState(false);

  const onToggleMenuBtn = () => {
    setMenu((prev) => !prev);
  };

  const onCloseMenu = () => {
    setMenu(false);
  };

  return (
    <>
      <button 
        onClick={onToggleMenuBtn} 
        className="bg-white border border-gray-400 text-lg px-3 py-1 rounded-md shadow-sm hover:bg-gray-100"
      >
        ☰
      </button>

      {menu && (
        <>
          <div className="fixed top-0 left-0 w-[75vw] h-screen bg-white shadow-md border-r border-gray-300 p-5 z-50">
            <button 
              onClick={onToggleMenuBtn} 
              className="absolute top-3 right-3 text-2xl"
            >
              ✖
            </button>
            {/* 자식에게 onCloseMenu 전달 */}
            {React.cloneElement(children as React.ReactElement<{ onClose?: () => void }>, { onClose: onCloseMenu })}
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
