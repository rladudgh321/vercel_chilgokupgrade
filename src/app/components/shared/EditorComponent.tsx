"use client"
import React, { useState, useRef } from 'react';
import { useFormContext } from 'react-hook-form';

interface EditorProps {
  name: string;  // 부모로부터 받을 name
}

const Editor: React.FC<EditorProps> = ({ name }) => {
  const { setValue } = useFormContext();  // useFormContext로 부모 데이터 접근
  const [editorContent, setEditorContent] = useState<string>('');
  const editorRef = useRef<HTMLDivElement>(null);

  // 콘텐츠 변경 시 상태 업데이트 및 부모에게 데이터 전달
  const handleEditorChange = (): void => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      setEditorContent(content);
      setValue(name, content);  // 부모 컴포넌트에 데이터 전달
    }
  };

  // 스타일 적용 함수
  const applyStyle = (style: string): void => {
    if (editorRef.current) {
      document.execCommand(style);  // 스타일 적용
      handleEditorChange();  // 스타일 적용 후 상태 업데이트
    }
  };

  // 다른 부분을 클릭했을 때 스크롤이 맨 위로 가는 문제 해결
  const handleEditorClick = (e: React.MouseEvent) => {
    if (editorRef.current) {
      // 클릭 전에 스크롤 위치를 저장
      const scrollTop = editorRef.current.scrollTop;

      // 기본 이벤트 동작 방지 (포커스가 이동하면서 스크롤이 리셋되는 것을 방지)
      e.preventDefault();

      // 포커스를 설정
      editorRef.current.focus();

      // 포커스 후 스크롤 위치 복원
      editorRef.current.scrollTop = scrollTop;
    }
  };

  return (
    <div className="w-full mx-auto p-4">
      {/* Toolbar */}
      <div className="flex space-x-4 bg-gray-100 p-3 rounded-lg shadow-md mb-4">
        <button 
          className="p-2 text-xl text-gray-700 hover:bg-gray-200 rounded"
          onClick={(e) => { 
            e.preventDefault();  // 다른 컴포넌트의 포커스를 방지
            applyStyle('bold');
          }}>
          <strong>B</strong>
        </button>
        <button 
          className="p-2 text-xl text-gray-700 hover:bg-gray-200 rounded"
          onClick={(e) => { 
            e.preventDefault();  // 다른 컴포넌트의 포커스를 방지
            applyStyle('italic');
          }}>
          <em>I</em>
        </button>
        <button 
          className="p-2 text-xl text-gray-700 hover:bg-gray-200 rounded"
          onClick={(e) => { 
            e.preventDefault();  // 다른 컴포넌트의 포커스를 방지
            applyStyle('underline');
          }}>
          <u>U</u>
        </button>
        <button 
          className="p-2 text-xl text-gray-700 hover:bg-gray-200 rounded"
          onClick={(e) => { 
            e.preventDefault();  // 다른 컴포넌트의 포커스를 방지
            applyStyle('strikeThrough');
          }}>
          <span className="line-through">S</span>
        </button>
        <button 
          className="p-2 text-xl text-gray-700 hover:bg-gray-200 rounded"
          onClick={(e) => { 
            e.preventDefault();  // 다른 컴포넌트의 포커스를 방지
            applyStyle('justifyLeft');
          }}>
          ←
        </button>
        <button 
          className="p-2 text-xl text-gray-700 hover:bg-gray-200 rounded"
          onClick={(e) => { 
            e.preventDefault();  // 다른 컴포넌트의 포커스를 방지
            applyStyle('justifyCenter');
          }}>
          ⇔
        </button>
        <button 
          className="p-2 text-xl text-gray-700 hover:bg-gray-200 rounded"
          onClick={(e) => { 
            e.preventDefault();  // 다른 컴포넌트의 포커스를 방지
            applyStyle('justifyRight');
          }}>
          →
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={true}
        onInput={handleEditorChange}  // 내용이 바뀔 때마다 상태 갱신
        onClick={handleEditorClick}  // 클릭 시 스크롤 위치 유지
        className="min-h-[300px] p-4 border border-gray-300 rounded-lg shadow-md text-gray-900 text-lg leading-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent whitespace-pre-wrap break-words bg-white"
      ></div>

      {/* Output */}
      <div className="mt-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
        <h3 className="text-xl font-semibold mb-2">Editor Output:</h3>
        <div>{editorContent}</div>
      </div>
    </div>
  );
};

export default Editor;
