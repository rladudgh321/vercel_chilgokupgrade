'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react'; // Added useState and useEffect

interface HeaderProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  logoUrl: string | null; // Changed type to string | null
}

const Header = ({ isOpen, setIsOpen, logoUrl }: HeaderProps) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false); // Added isMounted state

  useEffect(() => {
    setIsMounted(true); // Set isMounted to true after client-side mount
  }, []);

  const handleLogout = async () => {
    const response = await fetch('/api/admin/logout', {
      method: 'POST',
    });

    if (response.ok) {
      router.push('/admin/login');
      router.refresh();
    } else {
      console.error('Logout failed');
      // Optionally, show an error message to the user
    }
  };

  const handleRevalidate = async () => {
    const response = await fetch('/api/revalidate', { cache:'no-store' });
    if (response.ok) {
      alert('데이터가 최신화되었습니다.');
    } else {
      alert('데이터 최신화에 실패했습니다.');
      console.error('Revalidation failed');
    }
  };

  return (
    <header className="fixed grow top-0 left-0 right-0 flex items-center h-14 px-4 bg-gray-800 text-white z-10">
      <button 
        className="p-2" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>
      <div className="flex-1 text-center">
        <div className="relative inline-block h-10 w-24">
          {isMounted && logoUrl && <Image alt="logo" src={logoUrl} fill objectFit="contain" priority={true} />}
        </div>
      </div>
      <div>
        <button onClick={handleRevalidate} className="px-4 py-2 hover:bg-gray-700 rounded">데이터 최신화</button>
        <button onClick={handleLogout} className="px-4 py-2 hover:bg-gray-700 rounded">
          로그아웃
        </button>
      </div>
    </header>
  );
}

export default Header;
