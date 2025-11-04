import DragAndDropdProvider from "./DndProvider"


const WebViewLayout = ({children}: {children: React.ReactNode}) => {
  return (
    <div>
      <DragAndDropdProvider>
        {children}        
      </DragAndDropdProvider>
    </div>
  )
}

export default WebViewLayout