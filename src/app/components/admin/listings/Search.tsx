import SearchIcon from '@svg/Search';

const Search = () => {
  return (
    <form>
      <div className="flex h-8">
        <div className="border border-slate-500 rounded-l-xl">
          <input className='h-full' type="text" />
        </div>
        <button className=''><SearchIcon className="w-8 bg-slate-400 rounded-r-xl p-1" /></button>
      </div>
    </form>
  )
}

export default Search