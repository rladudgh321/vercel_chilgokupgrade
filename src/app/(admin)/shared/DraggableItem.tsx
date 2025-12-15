"use client"

import Image from 'next/image';
import { useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import imageCompression from "browser-image-compression";

type DraggableItemProps = {
  id: number;
  name: string;
  url?: string;
  imageUrl?: string;
  imageName?: string;
  moveItem: (draggedId: number, hoveredId: number) => void;
  onEdit?: (id: number, newName: string, newUrl?: string) => void;
  onDelete?: (id: number, name: string) => void;
  onImageEdit?: (id: number, newImageUrl: string, newImageName: string) => void;
  disabled?: boolean;
  uploadEndpoint?: string;
  imageMaxWidthOrHeight?: number;
};

const DraggableItem = ({ id, name, url, imageUrl, imageName, moveItem, onEdit, onDelete, onImageEdit, disabled = false, uploadEndpoint, imageMaxWidthOrHeight = 300 }: DraggableItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(name);
  const [editUrl, setEditUrl] = useState(url);
  const [isImageEditing, setIsImageEditing] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  const [, drag] = useDrag({
    type: 'item',
    item: { id },
    canDrag: !disabled && !isEditing,
  });

  const [, drop] = useDrop({
    accept: 'item',
    drop: (item: { id: number }) => {
      if (item.id !== id && !disabled && !isEditing) {
        moveItem(item.id, id);
        item.id = id;
      }
    },
    hover: (item: { id: number }) => {
      if (item.id !== id) {
        // Optionally highlight the hovered item
      }
    },
  });

  // Combine drag and drop refs
  drag(drop(ref));

  const handleEdit = () => {
    if (isEditing) {
      if (editValue.trim() && onEdit) {
        onEdit(id, editValue.trim(), editUrl);
      }
      setIsEditing(false);
    } else {
      setEditValue(name);
      setEditUrl(url);
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setEditValue(name);
    setEditUrl(url);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEdit();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleImageEdit = async () => {
    if (!selectedImageFile || !onImageEdit || !uploadEndpoint) return;

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: imageMaxWidthOrHeight,
        useWebWorker: true,
        fileType: "image/webp",
        quality: 0.8,
      };
      const compressedFile = await imageCompression(selectedImageFile, options);

      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('label', name);
      const response = await fetch(uploadEndpoint, { method: 'POST', body: formData });
      const result = await response.json();
      if (result.ok) {
        onImageEdit(id, result.data.imageUrl, result.data.imageName);
        setIsImageEditing(false);
        setSelectedImageFile(null);
      }
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
    }
  };

  const handleImageCancel = () => {
    setIsImageEditing(false);
    setSelectedImageFile(null);
  };

  return (
    <div
      ref={ref}
      className={`p-2 sm:p-4 mb-2 border rounded-lg transition-all dark:border-gray-700 ${
        disabled ? 'bg-gray-50 opacity-50 dark:bg-gray-900' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
      } ${isEditing ? 'bg-blue-50 border-blue-300 dark:bg-blue-900 dark:border-blue-700' : ''}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 flex-1 w-full">
          {/* 이미지 표시 */}
          {imageUrl && (
            <div className="w-16 h-16 flex-shrink-0">
              <Image
                src={imageUrl}
                alt={name}
                width={64}
                height={64}
                className="w-full h-full object-cover rounded border dark:border-gray-700"
              />
            </div>
          )}
          
          {/* 텍스트 편집 */}
          <div className="flex-1 w-full">
            {isEditing ? (
              <div>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
                  autoFocus
                />
                {url !== undefined && (
                  <input
                    type="text"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="w-full mt-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
                    placeholder="URL"
                  />
                )}
              </div>
            ) : (
              <div>
                <span className="text-lg font-medium dark:text-gray-200">{name}</span>
                {url && <div className="text-sm text-gray-500 dark:text-gray-400">{url}</div>}
              </div>
            )}
            
            {/* 이미지 편집 섹션 */}
            {isImageEditing && (
              <div className="mt-2 space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedImageFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:text-gray-300 dark:file:bg-blue-700 dark:file:text-blue-100 dark:hover:file:bg-blue-800"
                />
                {selectedImageFile && (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleImageEdit}
                      disabled={disabled}
                      className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-800"
                    >
                      이미지 저장
                    </button>
                    <button
                      onClick={handleImageCancel}
                      disabled={disabled}
                      className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-800"
                    >
                      취소
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-2 sm:mt-0 w-full sm:w-auto">
          {isEditing ? (
            <>
              <button
                onClick={handleEdit}
                disabled={disabled}
                className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50 w-full sm:w-auto dark:bg-green-700 dark:hover:bg-green-800"
              >
                저장
              </button>
              <button
                onClick={handleCancel}
                disabled={disabled}
                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 disabled:opacity-50 w-full sm:w-auto dark:bg-gray-700 dark:hover:bg-gray-800"
              >
                취소
              </button>
            </>
          ) : (
            <>
              {onEdit && (
                <button
                  onClick={handleEdit}
                  disabled={disabled}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50 w-full sm:w-auto dark:bg-blue-700 dark:hover:bg-blue-800"
                >
                  수정
                </button>
              )}
              {onImageEdit && (
                <button
                  onClick={() => setIsImageEditing(!isImageEditing)}
                  disabled={disabled}
                  className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 disabled:opacity-50 w-full sm:w-auto dark:bg-purple-700 dark:hover:bg-purple-800"
                >
                  이미지 {isImageEditing ? '취소' : (imageUrl ? '변경' : '추가')}
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(id, name)}
                  disabled={disabled}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50 w-full sm:w-auto dark:bg-red-700 dark:hover:bg-red-800"
                >
                  삭제
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DraggableItem;
