import DragAndDropdProvider from "./DndProvider"


const ListingsHeadingLayout = ({children}: {children: React.ReactNode}) => {
  return (
    <div>
      <DragAndDropdProvider>
        {children}        
      </DragAndDropdProvider>
    </div>
  )
}

export default ListingsHeadingLayout