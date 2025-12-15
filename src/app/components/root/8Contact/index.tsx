const Contact = ({children}: {children: React.ReactNode}) => {
  return (
    <div className="bg-cover bg-center lg:bg-no-repeat lg:bg-fixed h-full pb-14 bg-[url('/img/contact.png')]">
      <div className="mx-auto max-w-7xl">
        <div className="m-4 sm:m-6">
            <h2 className="text-2xl sm:text-3xl font-semibold leading-tight text-gray-900 dark:text-gray-100">원하시는 매물을<br />아직 못 찾으셨나요?</h2>
            <p className="mt-2 text-gray-700 dark:text-gray-300 text-base sm:text-lg">연락처를 남겨주시면<br />확인 후 빠르게<br />안내드리겠습니다</p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl">
        {children}
      </div>
    </div>
  );
}; 

export default Contact;
