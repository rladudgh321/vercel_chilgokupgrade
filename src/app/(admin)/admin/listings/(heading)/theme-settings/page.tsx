import ListManager from "@adminShared/ListManager";

const ThemeSettings = () => {
  return (
    <ListManager
      title="테마 설정(300px 설정)"
      placeholder="새로운 테마"
      buttonText="테마 등록"
      apiEndpoint="/api/theme-images"
      enableImageUpload={true}
    />
  );
};

export default ThemeSettings;
