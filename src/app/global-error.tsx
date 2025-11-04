'use client'; // Error components must be Client Components

import { useEffect } from 'react';
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    fetch("/api/slack-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: error.message, stack: error.stack }),
    });
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow flex flex-col items-center justify-center text-center">
            <h1 className="text-4xl font-bold mb-4">앗! 인터넷과 연결이 끊겼습니다</h1>
            <p className="text-lg">인터넷 연결을 확인하시고 잠시 후 다시 접속해주세요</p>
            <p className="text-lg mb-8">이 현상이 지속된다면 관리자에게 문의해주세요</p>
            <button
              onClick={() => reset()}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              다시 시도하기
            </button>
          </main>
        </div>
      </body>
    </html>
  );
}
