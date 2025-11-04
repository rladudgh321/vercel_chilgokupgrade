import ListManager from "@adminShared/ListManager";

const AreaSettings = () => {
  return (
    <ListManager
      title="면적 설정"
      placeholder="새로운 면적"
      buttonText="면적 등록"
      apiEndpoint="/api/area"
    />
  );
};

export default AreaSettings;
