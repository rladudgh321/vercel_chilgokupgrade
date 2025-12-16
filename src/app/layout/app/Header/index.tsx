import Image from "next/image";
import Header_Button from "./Header_Button";
import OpenMenu from "./OpenMenu";
import Link from "next/link";
import NavMenu from "./NavMenu";
import { getWorkInfo } from "@/app/(app)/layout";

export interface HeaderProps {
  address?: string;
  businessId?: string;
  companyName?: string;
  createdAt?: Date;
  email?: string;
  id?: string;
  logoName?: string;
  logoUrl?: string;
  mobile?: string;
  owner?: string;
  phone?: string;
  updatedAt?: Date;
}

const Header = async ({ headerPromise }: {headerPromise: ReturnType<typeof getWorkInfo>}) => {
  const headerData = await headerPromise;
  if(!headerData.ok || !headerData.data) {
    return null;
  }
  
  const style = headerData.data.logoName?.split('#')[1] || 'both';
  const showLogo = style === 'logo_only' || style === 'both';
  const showBrand = style === 'brand_only' || style === 'both';

  return (
    <header className="fixed top-0 left-0 w-full z-50 border-b border-white/10 bg-black">
      <div className="mx-auto max-w-7xl h-14 px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" aria-label="홈으로">
          {showLogo && headerData.data.logoUrl && (
            <div className="relative h-8 w-28 md:h-9 md:w-32">
              <Image
                alt="logo"
                src={headerData.data.logoUrl}
                fill
                priority
                sizes="(max-width: 768px) 112px, 128px"
                className="object-contain"
              />
            </div>
          )}
          {showBrand && headerData.data.companyName && (
            <span className="text-xl font-bold text-white">{headerData.data.companyName}</span>
          )}
        </Link>

        {/* Desktop Nav */}
        <NavMenu />

        {/* Mobile button */}
        <div className="md:hidden">
          <Header_Button 
            logoUrl={headerData.data.logoUrl}
            companyName={headerData.data.companyName}
            logoName={headerData.data.logoName}
          >
            <OpenMenu headerPromise={headerData.data} />
          </Header_Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
