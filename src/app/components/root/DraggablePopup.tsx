
'use client';

import { useState, useEffect, MouseEvent } from 'react';
import Image from 'next/image';
import { PopupPost } from './Popup';
import useWindowSize from '@/app/hooks/useWindowSize';

import { useRouter } from 'next/navigation';

// Re-using cookie functions from Popup.tsx, assuming they are co-located or imported
const setCookie = (name: string, value: string, days: number) => {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = '; expires=' + date.toUTCString();
  }
  document.cookie = name + '=' + (value || '')  + expires + '; path=/';
};

const getCookie = (name: string): string | null => {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

interface DraggablePopupProps {
  popup: PopupPost;
  zIndex: number;
  onFocus: () => void;
  initialPosition: { x: number, y: number };
}

const DraggablePopup = ({ popup, zIndex, onFocus, initialPosition }: DraggablePopupProps) => {
  const router = useRouter();
  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth < 768;
  const [visible, setVisible] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const cookie = getCookie(`popup_closed_${popup.id}`);
    if (!cookie) {
      setVisible(true);
    }
  }, [popup.id]);

  const handleContentClick = () => {
    router.push(`/notice/${popup.id}`);
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    onFocus();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isDragging && !isMobile) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClose = () => {
    if (dontShowToday) {
      setCookie(`popup_closed_${popup.id}`, 'true', 1);
    }
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  const width = popup.popupWidth || 400;
  const height = popup.popupHeight || 600;

  const mobileStyles = {
    width: '90vw',
    height: 'auto',
    maxHeight: '80vh',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  };

  const desktopStyles = {
    width: `${width}px`,
    height: `${height}px`,
    top: `${position.y}px`,
    left: `${position.x}px`,
  };

  return (
    <div
      className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col border-2 border-gray-300 dark:border-gray-600"
      style={{
        ...(isMobile ? mobileStyles : desktopStyles),
        zIndex,
        cursor: isDragging ? 'grabbing' : (isMobile ? 'default' : 'grab'),
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} // Stop dragging if mouse leaves the window
    >
      <div 
        className="p-2 bg-gray-200 dark:bg-gray-700 rounded-t-lg flex justify-between items-center"
        onMouseDown={handleMouseDown}
      >
        <span className="text-sm font-bold text-gray-700 dark:text-gray-200">공지사항</span>
      </div>
      <div onClick={handleContentClick} style={{ cursor: 'pointer' }} className="relative flex-grow overflow-y-auto bg-white dark:bg-gray-800">
        {popup.popupType === 'CONTENT' ? (
          <div 
            className="p-4 prose max-w-none break-words dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: popup.popupContent || '' }} 
          />
        ) : (
          popup.representativeImage && (
            <Image 
              src={popup.representativeImage}
              alt="Popup Image"
              fill
              objectFit="contain"
            />
          )
        )}
      </div>
      <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded-b-lg">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <label className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-300 mb-2 sm:mb-0">
            <input 
              type="checkbox" 
              checked={dontShowToday}
              onChange={(e) => setDontShowToday(e.target.checked)}
              className="form-checkbox h-3 w-3 text-blue-600 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
            />
            <span>24시간 동안 보지 않기</span>
          </label>
          <button 
            onClick={handleClose} 
            className="px-3 py-1 bg-gray-600 dark:bg-gray-700 text-white text-xs rounded-md hover:bg-gray-700 dark:hover:bg-gray-800 w-full sm:w-auto"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default DraggablePopup;
