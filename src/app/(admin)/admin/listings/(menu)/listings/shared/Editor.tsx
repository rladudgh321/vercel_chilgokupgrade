// app/components/admin/listings/Editor.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";

interface EditorProps {
  name: string; // RHF 필드명: 예) "editorContent"
  disabled?: boolean;
}

const Editor: React.FC<EditorProps> = ({ name, disabled }) => {
  const { setValue, register } = useFormContext();
  const valueFromForm = useWatch({ name }) as string | undefined; // ✅ 폼 값 구독
  const [html, setHtml] = useState<string>("");
  const editorRef = useRef<HTMLDivElement>(null);

  // 폼 값이 바뀌면(예: reset으로 서버값 주입) 에디터에 반영
  useEffect(() => {
    const incoming = valueFromForm ?? "";
    setHtml(incoming);
    if (editorRef.current && editorRef.current.innerHTML !== incoming) {
      editorRef.current.innerHTML = incoming;
    }
  }, [valueFromForm]);

  const handleEditorChange = () => {
    if (!editorRef.current) return;
    const content = editorRef.current.innerHTML;
    setHtml(content);
    setValue(name, content, { shouldDirty: true }); // ✅ 폼 값 업데이트
  };

  const applyStyle = (style: string) => {
    if (disabled) return;
    document.execCommand(style);
    handleEditorChange();
  };

  const handleEditorClick = (e: React.MouseEvent) => {
    if (!editorRef.current) return;
    const scrollTop = editorRef.current.scrollTop;
    e.preventDefault();
    editorRef.current.focus();
    editorRef.current.scrollTop = scrollTop;
  };

  return (
    <div className="w-full mx-auto p-2 sm:p-4 dark:bg-gray-800">
      {/* hidden input으로 RHF에 필드 등록 (초기 제출 안전장치) */}
      <input type="hidden" {...register(name)} value={html} readOnly />

      {/* 제목 */}
      <div className="flex flex-col">
        <label htmlFor="title" className="dark:text-gray-300">제목</label>
        <input
          type="text"
          id="title"
          placeholder="제목을 입력하세요"
          {...register("title", { required: true })}
          disabled={disabled}
          className="mt-1 block w-full p-2 sm:p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap space-x-2 sm:space-x-4 bg-gray-100 p-2 sm:p-3 rounded-lg shadow-md mb-4 mt-4 dark:bg-gray-700">
        <button className="p-2 text-lg sm:text-xl text-gray-700 hover:bg-gray-200 rounded dark:text-gray-300 dark:hover:bg-gray-600" onClick={(e) => { e.preventDefault(); applyStyle("bold"); }} disabled={disabled}>
          <strong>B</strong>
        </button>
        <button className="p-2 text-lg sm:text-xl text-gray-700 hover:bg-gray-200 rounded dark:text-gray-300 dark:hover:bg-gray-600" onClick={(e) => { e.preventDefault(); applyStyle("italic"); }} disabled={disabled}>
          <em>I</em>
        </button>
        <button className="p-2 text-lg sm:text-xl text-gray-700 hover:bg-gray-200 rounded dark:text-gray-300 dark:hover:bg-gray-600" onClick={(e) => { e.preventDefault(); applyStyle("underline"); }} disabled={disabled}>
          <u>U</u>
        </button>
        <button className="p-2 text-lg sm:text-xl text-gray-700 hover:bg-gray-200 rounded dark:text-gray-300 dark:hover:bg-gray-600" onClick={(e) => { e.preventDefault(); applyStyle("strikeThrough"); }} disabled={disabled}>
          <span className="line-through">S</span>
        </button>
        <button className="p-2 text-lg sm:text-xl text-gray-700 hover:bg-gray-200 rounded dark:text-gray-300 dark:hover:bg-gray-600" onClick={(e) => { e.preventDefault(); applyStyle("justifyLeft"); }} disabled={disabled}>←</button>
        <button className="p-2 text-lg sm:text-xl text-gray-700 hover:bg-gray-200 rounded dark:text-gray-300 dark:hover:bg-gray-600" onClick={(e) => { e.preventDefault(); applyStyle("justifyCenter"); }} disabled={disabled}>⇔</button>
        <button className="p-2 text-lg sm:text-xl text-gray-700 hover:bg-gray-200 rounded dark:text-gray-300 dark:hover:bg-gray-600" onClick={(e) => { e.preventDefault(); applyStyle("justifyRight"); }} disabled={disabled}>→</button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleEditorChange}
        onClick={handleEditorClick}
        className="min-h-[200px] sm:min-h-[300px] p-2 sm:p-4 border border-gray-300 rounded-lg shadow-md text-gray-900 text-base sm:text-lg leading-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent whitespace-pre-wrap break-words bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      />

      {/* 비밀 메모 (에디터 아래) */}
      <div className="mt-4 sm:mt-6 space-y-4">
        <div className="flex flex-col">
          <label htmlFor="secretNote" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            비밀 메모 (내부용)
          </label>
          <textarea
            id="secretNote"
            placeholder="내부 공유용 메모를 입력하세요 (외부 비공개)"
            rows={3}
            {...register("secretNote")}
            disabled={disabled}
            className="mt-1 block w-full p-2 sm:p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          />
        </div>
      </div>
    </div>
  );
};

export default Editor;
