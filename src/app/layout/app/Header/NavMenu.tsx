"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { title: "지도로 검색", href: "/landSearch" },
  { title: "목록으로 검색", href: "/card" },
  { title: "회사소개", href: "/intro" },
  { title: "공지사항", href: "/notice" },
  { title: "매물의뢰", href: "/orders" },
];

const NavMenu = () => {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-6">
      {menuItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href);

        return (
          <div key={item.title} className="relative">
            <Link
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={[
                "relative text-sm font-medium transition-colors",
                "text-white/80 hover:text-white focus-visible:text-white",
                "outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded",
                "px-1 py-0.5", // 포커스 링과 밑줄의 여유
              ].join(" ")}
            >
              {item.title}

              {/* 밑줄 애니메이션 */}
              <span
                className={[
                  "pointer-events-none absolute left-0 -bottom-1 h-[2px] w-full origin-left bg-white transition-transform duration-200",
                  isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                ].join(" ")}
                aria-hidden="true"
              />
            </Link>
          </div>
        );
      })}
    </nav>
  );
};

export default NavMenu;
