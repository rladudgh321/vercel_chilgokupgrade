import ListManager from "@adminShared/ListManager";

const Labels = () => {
  return (
    <ListManager
      title="라벨 설정"
      placeholder="새로운 라벨"
      buttonText="라벨 등록"
      apiEndpoint="/api/labels"
    />
  );
};

export default Labels;
