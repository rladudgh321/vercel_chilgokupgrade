import ListManager from "@/app/(admin)/shared/ListManager"

const RoomPage = () => {
  return (
    <>
      <ListManager
      title="방 갯수"
      placeholder="ex) '1층' -  띄어쓰기 금지"
      buttonText="등록"
      apiEndpoint="/api/room-options"
    />
    <ListManager
      title="층 단위"
      placeholder="ex) '1층~3층' -  띄어쓰기 금지"
      buttonText="등록"
      apiEndpoint="/api/floor-options"
    />
    <ListManager
      title="화장실 갯수"
      placeholder="ex) '1개' -  띄어쓰기 금지"
      buttonText="등록"
      apiEndpoint="/api/bathroom-options"
    />
    </>
  )
}

export default RoomPage