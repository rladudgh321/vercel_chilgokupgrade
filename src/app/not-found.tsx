import Link from "next/link";
import Footer from './layout/app/Footer';
import Header from './layout/app/Header';
import { getWorkInfo } from './(app)/layout';
import { Suspense } from "react";


export default function NotFound() {
  const headerPromise = getWorkInfo();
  return (
    <div className="flex flex-col min-h-screen">
      <Suspense>
        <Header headerPromise={headerPromise} />
      </Suspense>
      <main className="flex-grow flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold mb-4">찾을 수 없는 페이지입니다</h1>
        <p className="text-lg mb-8">죄송합니다. 현재는 존재하지 않은 페이지입니다.</p>
        <Link href="/" className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          홈으로 가기
        </Link>
      </main>
      <Suspense>
        <Footer headerPromise={headerPromise} />
      </Suspense>
    </div>
  );
}
