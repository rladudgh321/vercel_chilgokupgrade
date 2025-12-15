const Container = ({children, title}: {children: React.ReactNode; title: string;}) => {
  return (
    <div className="w-full mx-auto bg-white rounded-lg shadow-lg p-2 sm:p-4 md:p-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <h3 className="px-2 sm:px-4 bg-slate-200 h-12 sm:h-14 flex items-center font-bold text-base sm:text-lg dark:bg-slate-700 text-gray-900 dark:text-gray-100">{title}</h3>
      <div className="p-2 sm:p-4 space-y-4 sm:space-y-6 bg-slate-100 dark:bg-slate-900">
        {children}
      </div>
    </div>
  );
};

export default Container;