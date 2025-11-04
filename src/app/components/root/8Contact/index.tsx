const Contact = ({children}: {children: React.ReactNode}) => {
  return (
    <div className="bg-cover bg-center h-full border-t pb-14 border-purple-500 bg-[url('/img/contact.png')]">
      <div className="mx-auto max-w-7xl">
        <div className="m-4 sm:m-6">
            <h2 className="text-2xl sm:text-3xl font-semibold leading-tight">번호를 남기시면<br />상담해드리겠습니다!</h2>
            <p className="text-base sm:text-lg mt-2">원하시는 매물을 못찾으셨나요?<br />번호를 남겨주시면 확인 후 <br />신속히 답변드리겠습니다</p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl">
        {children}
      </div>
    </div>
  );
};

export default Contact;
