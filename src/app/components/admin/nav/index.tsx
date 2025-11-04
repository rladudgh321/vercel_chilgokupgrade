"use client";

import React, { ComponentType, useState } from "react";
import { useRouter } from "next/navigation";
import ListingsMenu from "./ListingsMenu";
import InquiriesMenu from "./InquiriesMenu";
import BoardMenu from "./BoardMenu";
import WebsiteSettingsMenu from "./WebsiteSettingsMenu";
import WebViewMenu from "./WebViewMenu";
import OtherMenu from "./OtherMenu";
import { clsx } from "clsx";
import Link from "next/link";

// 메뉴 데이터
const listingsData = [
  { title: "매물 목록", url: "listings" },
  { title: "삭제된 매물", url: "deleted-listings" },
  { title: "매물 종류관리", url: "listing-types" },
  { title: "테마 관리", url: "theme-settings" },
  { title: "옵션 관리", url: "options-settings" },
  { title: "라벨 관리", url: "labels" },
  { title: "거래유형 관리", url: "buy-types" },
  { title: "방 / 층 / 화장실 관리", url: "room" },
  { title: "면적 관리", url: "area" },
  { title: "카테고리 관리", url: "category-settings" },
];

const inquiriesData = [
  { title: "의뢰 내역", url: "orders" },
  { title: "연락 요청", url: "contact-requests" },
];

const boardData = [
  { title: "게시판 카테고리 관리", url: "categories" },
  { title: "관리자 게시판", url: "admin-board" },
];

const websiteSettingsData = [
  { title: "홈페이지 정보", url: "website-info" },
  { title: "SNS 설정", url: "sns-settings" },
];

const webViewData = [
  { title: "배너 설정", url: "banner" },
  { title: "로고 설정", url: "logo-settings" },
];

const otherData = [
  { title: "접속 기록", url: "access-logs" },
  { title: "차단된 IP", url: "banned-ips" },
];

// 메뉴 설정
const totalMenu = [
  { menu: "listings", title: "매물관리", data: listingsData, component: ListingsMenu, icon: "🏠" },
  { menu: "inquiries", title: "문의관리", data: inquiriesData, component: InquiriesMenu, icon: "📞" },
  { menu: "board", title: "게시판 관리", data: boardData, component: BoardMenu, icon: "📋" },
  { menu: "websiteSettings", title: "홈페이지 설정", data: websiteSettingsData, component: WebsiteSettingsMenu, icon: "⚙️" },
  { menu: "webView", title: "홈페이지 화면 설정", data: webViewData, component: WebViewMenu, icon: "🖼️" },
  { menu: "other", title: "기타", data: otherData, component: OtherMenu, icon: "🔧" },
];

interface AdminNavProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const AdminNav = ({ isOpen, setIsOpen }: AdminNavProps) => {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  const toggleMenu = (menu: string) => {
    if (menu === 'customers') {
      handleNavigation('/admin/customers');
      return;
    }
    setOpenMenu((prev) => (prev === menu ? null : menu));

    const menuData = totalMenu.find((item) => item.menu === menu);
    if (menuData) {
      menuData.data.forEach(({ url }) => {
        router.prefetch(`/admin/${menu}/${url}`);
      });
    }
  };

  // MenuItem 컴포넌트: 각 메뉴 항목을 렌더링
  const MenuItem = ({
    menu,
    title,
    data,
    Component,
    icon,
  }: {
    menu: string;
    title: string;
    data: { title: string; url: string }[];
    Component: ComponentType<{ data: { title: string; url: string }[] }> | null;
    icon: string;
  }) => (
    <li className={clsx({ "text-center": !isOpen })}>
      <button
        onClick={() => toggleMenu(menu)}
        className={clsx(
          "w-full text-left hover:bg-gray-700 p-2 rounded-md flex items-center",
          { "justify-center": !isOpen }
        )}
      >
        <span className="text-xl">{icon}</span>
        {isOpen && <span className="ml-4">{title}</span>}
        {isOpen && Component && (
          <span
            className={clsx("ml-auto transform transition-transform duration-700", {
              "rotate-180": openMenu === menu,
            })}
          >
            ▼
          </span>
        )}
      </button>
      {isOpen && (
        <div
          className={clsx("transition-all duration-500", {
            "opacity-100 scale-100": openMenu === menu,
            "opacity-0 scale-95": openMenu !== menu,
          })}
        >
          {openMenu === menu && Component && <Component data={data} />}
        </div>
      )}
    </li>
  );

  return (
    <nav
      className={clsx(
        "h-full bg-gray-700 text-white p-4 z-20 transform transition-transform duration-300 ease-in-out mt-14",
        { "translate-x-0": isOpen, "-translate-x-full sm:translate-x-0": !isOpen }
      )}
    >
      <ul className="space-y-4 mt-10 sm:mt-0">
        {totalMenu.map(({ menu, title, data, component, icon }) => (
          <MenuItem key={menu} menu={menu} title={title} data={data} Component={component} icon={icon} />
        ))}
        <Link href="/admin"><li className="flex justify-center bg-blue-900 py-10">대시<br />보드</li></Link>
      </ul>
    </nav>
  );
};

export default AdminNav;


{/* <li className="flex justify-center bg-blue-900 py-10"><Link href="/admin">대시<br />보드</Link></li> */}