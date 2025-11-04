import Link from 'next/link';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white">
      <div className="text-center max-w-lg p-6 bg-opacity-90 rounded-xl shadow-lg">
        <h1 className="text-6xl font-extrabold tracking-tight mb-4">404</h1>
        <p className="text-xl mb-4">해당 페이지는 기능 구현이 되지 않았습니다.</p>
        <p className="text-lg mb-6">사용자의 필요성이 있을 때 말씀해주시길 바랍니다.</p>
        <Link href="/">
          <a className="text-lg font-semibold text-blue-200 hover:text-blue-100 transition-all duration-300">홈으로 돌아가기</a>
        </Link>
      </div>
    </div>
  );
};

export default NotFound
