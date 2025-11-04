import Link from "next/link";

const SearchMapList = () => {
  return (
    <div className="mx-auto max-w-7xl flex justify-center text-center space-x-2 m-4">
      <Link
        href="/landSearch" 
        className="w-[47vw] h-[100px] sm:h-[130px] md:h-[160px] bg-center bg-cover bg-no-repeat border border-gray-300 bg-[url('/img/map_search.webp')]" 
      ></Link>
      <Link
        href="/card" 
        className="w-[47vw] h-[100px] sm:h-[130px] md:h-[160px] bg-center bg-cover bg-no-repeat border border-gray-300 bg-[url('/img/list_search.webp')]" 
      />
    </div>
  );
};

export default SearchMapList;
