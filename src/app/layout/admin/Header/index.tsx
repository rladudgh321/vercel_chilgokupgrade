'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface HeaderProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  logoUrl?: string | null;
  companyName?: string | null;
  logoName?: string | null;
}

const Header = ({ isOpen, setIsOpen, logoUrl, companyName, logoName }: HeaderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
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
    }
  };

  const handleRevalidate = async () => {
    const response = await fetch('/api/revalidate', { cache: 'no-store' });
    if (response.ok) {
      alert('데이터가 최신화되었습니다.');
    } else {
      alert('데이터 최신화에 실패했습니다.');
      console.error('Revalidation failed');
    }
  };

  const renderAdminLogoAndBrand = () => {
    if (!isMounted) return null;

    const style = logoName?.split('#')[1] || 'both';
    const showLogo = style === 'logo_only' || style === 'both';
    const showBrand = style === 'brand_only' || style === 'both';

    return (
      <Link href="/admin" className="flex items-center justify-center gap-2">
        {showLogo && logoUrl && (
          <div className="relative h-10 w-24">
            <Image
              alt="logo"
              src={logoUrl}
              fill
              style={{objectFit:"contain"}}
              priority={true}
            />
          </div>
        )}
        {showBrand && companyName && (
          <span className="text-lg font-semibold text-white">{companyName}</span>
        )}
      </Link>
    );
  };

  return (
    <header className="fixed grow top-0 left-0 right-0 flex items-center h-14 px-4 bg-gray-800 text-white z-10">
      {pathname !== '/admin/login' && (
        <button 
          className="p-2" 
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      )}
      <div className="flex-1 text-center">
        {renderAdminLogoAndBrand()}
      </div>
      {pathname !== '/admin/login' && (
        <div>
          <button onClick={handleRevalidate} className="px-4 py-2 hover:bg-gray-700 rounded">데이터 최신화</button>
          <button onClick={handleLogout} className="px-4 py-2 hover:bg-gray-700 rounded">
            로그아웃
          </button>
        </div>
      )}
    </header>
  );
}

export default Header;
