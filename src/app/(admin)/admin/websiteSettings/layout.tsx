import DragAndDropdProvider from "./DndProvider"


const WebsiteSettingsLayout = ({children}: {children: React.ReactNode}) => {
  return (
    <div>
      <DragAndDropdProvider>
        {children}        
      </DragAndDropdProvider>
    </div>
  )
}

export default WebsiteSettingsLayout