"use client"

const Pagination = ({
  totalPages,
  currentPage,
  onPageChange,
}: {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}) => {
  const pageGroupSize = 10; // 한 번에 보여줄 페이지 수
  const currentGroup = Math.floor((currentPage - 1) / pageGroupSize); // 현재 페이지 그룹
  const startPage = currentGroup * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

  return (
    <div className="flex gap-2 mt-4 justify-center">
      {/* 이전 그룹 버튼 */}
      {currentGroup > 0 && (
        <button
          onClick={() => onPageChange(startPage - pageGroupSize)}
          className="px-4 py-2 bg-gray-300"
        >
          이전
        </button>
      )}

      {/* 페이지 번호 */}
      {[...Array(endPage - startPage + 1)].map((_, index) => (
        <button
          key={startPage + index}
          onClick={() => onPageChange(startPage + index)}
          className={`px-4 py-2 ${
            currentPage === startPage + index ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          {startPage + index}
        </button>
      ))}

      {/* 다음 그룹 버튼 */}
      {endPage < totalPages && (
        <button
          onClick={() => onPageChange(startPage + pageGroupSize)}
          className="px-4 py-2 bg-gray-300"
        >
          다음
        </button>
      )}
    </div>
  );
};


export default Pagination;