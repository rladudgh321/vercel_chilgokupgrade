import Image from "next/image";
import { HeaderProps } from '../Header';
import { getWorkInfo } from "@/app/(app)/layout";

const Footer = async ({ headerPromise }: {headerPromise: ReturnType<typeof getWorkInfo>}) => {
  const headerData = await headerPromise;
  if(!headerData.ok || !headerData.data) {
    return null;
  }
  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* 로고 및 회사명 */}
          <div className="flex flex-col items-start">
           {headerData.data.logoUrl && <Image 
              src={String(headerData.data.logoUrl)} 
              alt="logo" 
              width={120} 
              height={60}
              className="w-auto h-auto" 
            />}
            <p className="mt-4 text-lg font-bold text-white">
              {headerData.data.companyName}
            </p>
          </div>

          {/* 상세 정보 */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Contact</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <span className="font-semibold w-16 inline-block">전화:</span>
                  <span>{headerData.data.phone}</span>
                </li>
                <li>
                  <span className="font-semibold w-16 inline-block">휴대폰:</span>
                  <span>{headerData.data.mobile}</span>
                </li>
                <li>
                  <span className="font-semibold w-16 inline-block">이메일:</span>
                  <a href={`mailto:${headerData.data.email}`} className="hover:text-white transition-colors">
                    {headerData.data.email}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Information</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <span className="font-semibold w-24 inline-block">대표자:</span>
                  <span>{headerData.data.owner}</span>
                </li>
                <li>
                  <span className="font-semibold w-24 inline-block">사업자번호:</span>
                  <span>{headerData.data.businessId}</span>
                </li>
                <li>
                  <span className="font-semibold w-24 inline-block">주소:</span>
                  <span>{headerData.data.address}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 하단 저작권 */}
        <div className="mt-12 border-t border-gray-700 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs">
          <p>&copy; {new Date().getFullYear()} {headerData.data.companyName || "회사 이름, Inc."}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
