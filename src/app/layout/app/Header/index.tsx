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
  return (
    <header className="fixed top-0 left-0 w-full z-50 border-b border-white/10 bg-black">
      <div className="mx-auto max-w-7xl h-14 px-4 flex items-center justify-between">
        <Link href="/" className="relative h-8 w-28 md:h-9 md:w-32" aria-label="홈으로">
          {headerData.data.logoUrl && <Image
            alt="logo"
            src={headerData.data.logoUrl!}
            fill
            priority
            sizes="(max-width: 768px) 112px, 128px"
            className="object-contain"
          />}
        </Link>

        {/* Desktop Nav */}
        <NavMenu />

        {/* Mobile button */}
        <div className="md:hidden">
          <Header_Button>
            <OpenMenu headerPromise={headerData.data} />
          </Header_Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
