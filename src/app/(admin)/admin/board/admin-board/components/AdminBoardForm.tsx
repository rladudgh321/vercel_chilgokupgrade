"use client"
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale/ko";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic'

const Editor = dynamic(() => import('@/app/components/shared/Editor'), { ssr: false });
const DatePicker = dynamic(() => import('react-datepicker'), { ssr: false });

interface Post {
  id?: number
  title: string
  content: string
  popupContent?: string
  representativeImage?: string | null
  registrationDate: string | Date
  manager: string
  isAnnouncement?: boolean
  isPopup: boolean
  popupWidth?: number
  popupHeight?: number
  isPublished: boolean
  popupType?: 'IMAGE' | 'CONTENT'
  categoryId?: number
}

interface Category {
  id: number;
  name: string;
}

interface AdminBoardFormProps {
  initialData?: Post
  isEdit?: boolean
  categories: Category[];
}

const AdminBoardForm = ({ initialData, isEdit = false, categories }: AdminBoardFormProps) => {
  const router = useRouter()
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    representativeImage: null as File | null,
    representativeImageUrl: initialData?.representativeImage || null,
    registrationDate: initialData?.createdAt ? new Date(initialData.createdAt) : new Date(),
    manager: initialData?.manager || "데모",
    title: initialData?.title || "",
    content: initialData?.content || "",
    popupContent: initialData?.popupContent || "",
    categoryId: initialData?.categoryId || undefined,
    isPopup: initialData?.isPopup ? "사용" : "미사용",
    popupWidth: initialData?.popupWidth?.toString() || "400",
    popupHeight: initialData?.popupHeight?.toString() || "400",
    isPublished: initialData?.isPublished === undefined ? true : initialData.isPublished,
    popupType: initialData?.popupType || 'IMAGE',
    isAnnouncement: initialData?.isAnnouncement || false,
  });

  const handleContentChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, content: value }))
  }, []);

  const handlePopupContentChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, popupContent: value }))
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, representativeImage: file, representativeImageUrl: URL.createObjectURL(file) }))
    }
  }

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('prefix', 'board');
      const uploadRes = await fetch('/api/image/upload', { method: 'POST', body: fd });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadJson.message || '이미지 업로드 실패');
      return uploadJson.url as string;
    },
  });

  const postMutation = useMutation({
    mutationFn: async (data: any) => {
      const apiUrl = isEdit ? `/api/board/posts/${initialData?.id}` : '/api/board/posts';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(apiUrl, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || `게시글 ${isEdit ? '수정' : '저장'}에 실패했습니다`);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boardPosts'] });
      alert(`게시글이 ${isEdit ? '수정' : '저장'}되었습니다.`);
      router.push("/admin/board/admin-board");
      router.refresh();
    },
    onError: (error: any) => {
      console.error(`Error ${isEdit ? 'updating' : 'creating'} post:`, error);
      alert(error.message || `게시글 ${isEdit ? '수정' : '저장'}에 실패했습니다.`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let representativeImageUrl: string | undefined | null = initialData?.representativeImage;
      if (formData.representativeImage) {
        representativeImageUrl = await uploadImageMutation.mutateAsync(formData.representativeImage);
      }

      const submitData = {
        title: formData.title,
        content: formData.content,
        popupContent: formData.popupContent,
        representativeImage: representativeImageUrl,
        registrationDate: (formData.registrationDate as Date).toISOString().slice(0, 10),
        manager: formData.manager,
        categoryId: formData.categoryId ? parseInt(String(formData.categoryId)) : undefined,
        isPopup: formData.isPopup === "사용",
        popupWidth: formData.popupWidth ? parseInt(formData.popupWidth) : undefined,
        popupHeight: formData.popupHeight ? parseInt(formData.popupHeight) : undefined,
        isPublished: formData.isPublished,
        popupType: formData.popupType,
        isAnnouncement: formData.isAnnouncement,
      };

      await postMutation.mutateAsync(submitData);

    } catch (error: any) {
      console.error(`Error in handleSubmit:`, error);
      alert(error.message || `작업에 실패했습니다.`);
    }
  };

  return (    <div className="min-h-screen bg-gray-50">
      <div className="bg-purple-600 text-white py-3 sm:py-4 px-4 sm:px-6">
        <h1 className="text-xl sm:text-2xl font-bold">{isEdit ? '글수정' : '글쓰기'}</h1>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                등록일
              </label>
              <DatePicker
                selected={formData.registrationDate instanceof Date ? formData.registrationDate : null}
                onChange={(date: Date | null) => {
                  if (date) {
                    setFormData(prev => ({ ...prev, registrationDate: date }));
                  } else {
                    setFormData(prev => ({ ...prev, registrationDate: new Date() })); // Default to new Date()
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                dateFormat="yyyy-MM-dd"
                locale={ko}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                담당자
              </label>
              <select
                value={formData.manager}
                onChange={(e) => setFormData(prev => ({ ...prev, manager: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="데모">데모</option>
                <option value="관리자">관리자</option>
                <option value="운영자">운영자</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              공개여부
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="isPublished"
                  value="true"
                  checked={formData.isPublished === true}
                  onChange={() => setFormData(prev => ({ ...prev, isPublished: true }))}
                  className="form-radio h-4 w-4 text-purple-600"
                />
                <span className="ml-2 text-gray-700">공개</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="isPublished"
                  value="false"
                  checked={formData.isPublished === false}
                  onChange={() => setFormData(prev => ({ ...prev, isPublished: false }))}
                  className="form-radio h-4 w-4 text-purple-600"
                />
                <span className="ml-2 text-gray-700">비공개</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="제목"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              내용
            </label>
            <Editor value={formData.content} onChange={handleContentChange} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                공지여부
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => {
                  const newCategoryId = parseInt(e.target.value);
                  const selectedCategory = categories.find(c => c.id === newCategoryId);
                  setFormData(prev => ({
                    ...prev,
                    categoryId: newCategoryId,
                    isAnnouncement: selectedCategory ? selectedCategory.name === '공지' : false
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">선택</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                팝업여부
              </label>
              <select
                value={formData.isPopup}
                onChange={(e) => setFormData(prev => ({ ...prev, isPopup: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="미사용">미사용</option>
                <option value="사용">사용</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                팝업크기
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={formData.popupWidth}
                    onChange={(e) => setFormData(prev => ({ ...prev, popupWidth: e.target.value }))}
                    className="w-full sm:w-20 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="400"
                  />
                  <span className="flex items-center text-gray-500">px</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={formData.popupHeight}
                    onChange={(e) => setFormData(prev => ({ ...prev, popupHeight: e.target.value }))}
                    className="w-full sm:w-20 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="400"
                  />
                  <span className="flex items-center text-gray-500">px</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              팝업 타입
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="popupType"
                  value="IMAGE"
                  checked={formData.popupType === 'IMAGE'}
                  onChange={() => setFormData(prev => ({ ...prev, popupType: 'IMAGE' }))}
                  className="form-radio h-4 w-4 text-purple-600"
                />
                <span className="ml-2 text-gray-700">팝업이미지</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="popupType"
                  value="CONTENT"
                  checked={formData.popupType === 'CONTENT'}
                  onChange={() => setFormData(prev => ({ ...prev, popupType: 'CONTENT' }))}
                  className="form-radio h-4 w-4 text-purple-600"
                />
                <span className="ml-2 text-gray-700">팝업내용</span>
              </label>
            </div>
          </div>

          {formData.popupType === 'IMAGE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                팝업이미지
              </label>
              <p className="text-sm text-gray-500 mb-2">
                가로 1600px 이상은 자동 리사이징 됩니다.
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor="image-upload"
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg cursor-pointer hover:bg-gray-600"
                >
                  파일 선택
                </label>
                <span className="text-gray-600">
                  {formData.representativeImage ? formData.representativeImage.name : (initialData?.representativeImage ? "기존 이미지" : "선택된 파일 없음")}
                </span>
              </div>
              {formData.representativeImageUrl && (
                <div className="mt-4">
                  <Image src={formData.representativeImageUrl} alt="preview" className="w-full max-w-xs rounded" width={320} height={240} style={{ objectFit: 'contain' }} />
                </div>
              )}
            </div>
          )}

          {formData.popupType === 'CONTENT' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                팝업내용
              </label>
              <Editor value={formData.popupContent} onChange={handlePopupContentChange} />

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  팝업 미리보기
                </label>
                <div
                  className="border-2 border-dashed border-gray-400 p-4 overflow-y-auto w-full h-auto"
                  style={{
                    maxWidth: `${formData.popupWidth || 400}px`,
                    maxHeight: `${formData.popupHeight || 400}px`,
                  }}
                >
                  <div
                    className="prose max-w-none break-words h-full"
                    dangerouslySetInnerHTML={{ __html: formData.popupContent || '' }}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => router.push("/admin/board/admin-board")}
              className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 w-full sm:w-auto"
            >
              목록
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 w-full sm:w-auto"
            >
              {isEdit ? '수정' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminBoardForm