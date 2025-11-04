// const TitleArea = ({ title, onChangeTitle, description, onChangeDescription }) => {
const TitleArea = () => {
  return (
    <>
      <div className="flex mt-1">
        <label htmlFor="tit" className="my-auto mr-2">큰제목</label>
        <textarea
          id="tit"
          // value={title}
          // onChange={onChangeTitle}
          className="w-[85%] p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="flex mt-1">
        <label htmlFor="desc" className="my-auto mr-2">기타사항</label>
        <textarea
          id="desc"
          // value={description}
          // onChange={onChangeDescription}
          className="w-[85%] p-2 border border-gray-300 rounded-md"
        />
      </div>
    </>
  );
};

export default TitleArea;
