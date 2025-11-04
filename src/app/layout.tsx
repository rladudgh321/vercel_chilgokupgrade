import TanstackProvider from "./components/shared/TanstackProvider";
import "./globals.css";
import "react-datepicker/dist/react-datepicker.css";
import localFont from 'next/font/local'
import Script from "next/script";

const myFontWoff2 = localFont({
  src: [
    {
      path: '../assets/font/NanumSquareB.woff2',
    }
  ],
  preload: true,
  display: 'block',
  variable: "--font-nanum-b",
})

const myFontFallback = localFont({
  src: [
    {
      path: '../assets/font/NanumSquareB.woff',
    },
    {
      path: '../assets/font/NanumSquareB.ttf',
    }
  ],
  preload: false,
  display: 'block',
  variable: "--font-nanum-b",
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
  return (
    <html lang="ko" suppressHydrationWarning className="h-full">
      <head>
        {KAKAO_KEY && (
          <Script
            id="kakao-maps-sdk"
            src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&libraries=services,clusterer&autoload=false`}
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body
        className={`${myFontWoff2.variable} ${myFontFallback.variable} antialiased h-full flex flex-col`}
      >
        <TanstackProvider>{children}</TanstackProvider>
      </body>
    </html>
  );
}
