"use client";

import ListManager from "@/app/(admin)/shared/ListManager";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const BoardCategoriesPage = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <ListManager
        title="게시판 카테고리 설정"
        placeholder="새로운 카테고리"
        buttonText="카테고리 등록"
        apiEndpoint="/api/board/categories"
      />
    </DndProvider>
  );
};

export default BoardCategoriesPage;
