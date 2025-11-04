

const ListingsMenuLayout = ({children}: {children: React.ReactNode}) => {
  return (
    <div className="p-4">
      {/* 메인 매물 목록리스트 */}
      <div className="mt-4">
        {children}
      </div>
    </div>
  )
}

export default ListingsMenuLayout
