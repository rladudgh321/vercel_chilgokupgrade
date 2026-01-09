"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { uploadImage, uploadImages } from "@/app/apis/build";

type FormShape = {
  mainImage?: string;
  subImage?: string[];
  adminImage?: string[];
  blogUrl?: string;
  isBlogURL?: boolean;
};

const isValidImgSrc = (s: unknown): s is string => {
  if (typeof s !== "string") return false;
  const v = s.trim();
  if (!v) return false;
  // 외부 URL 또는 루트 상대경로만 허용
  if (v.startsWith("http://") || v.startsWith("https://")) return true;
  if (v.startsWith("/")) return true;
  return false;
};

const arraysEqual = (a: string[] = [], b: string[] = []) => {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
};

const unique = (arr: string[]) => Array.from(new Set(arr));

const SaveImage: React.FC<{ onImageLoadingStateChange?: (isLoading: boolean) => void }> = ({ onImageLoadingStateChange }) => {
  const { getValues, setValue, register, control } = useFormContext<FormShape>();

  // 미리보기용 로컬 상태 (getValues로 초기화)
  const [mainImage, setMainImage] = useState<string | null>(() => getValues("mainImage"));
  const [propertyImages, setPropertyImages] = useState<string[]>(() => getValues("subImage") || []);
  const [adminImages, setAdminImages] = useState<string[]>(() => getValues("adminImage") || []);

  // 이미지 로딩 상태
  const [mainImageLoading, setMainImageLoading] = useState(false);
  const [propertyImagesLoading, setPropertyImagesLoading] = useState<boolean[]>([]);
  const [adminImagesLoading, setAdminImagesLoading] = useState<boolean[]>([]);

  // 이미지 에러 상태
  const [mainImageError, setMainImageError] = useState(false);
  const [propertyImagesError, setPropertyImagesError] = useState<boolean[]>([]);
  const [adminImagesError, setAdminImagesError] = useState<boolean[]>([]);

  // 업로드 에러 메시지
  const [mainImageUploadError, setMainImageUploadError] = useState<string | null>(null);
  const [propertyImagesUploadError, setPropertyImagesUploadError] = useState<string | null>(null);
  const [adminImagesUploadError, setAdminImagesUploadError] = useState<string | null>(null);



  // ─────────────────────────────────────────────────────────
  // 업로드 뮤테이션
  // 서버는 절대 URL을 반환한다고 가정({ url } | { urls: string[] })
  // ─────────────────────────────────────────────────────────
  const mainImageMutation = useMutation({
    mutationFn: uploadImage,
    onSuccess: (data: { url: string }) => {
      const url = data.url;
      if (!isValidImgSrc(url)) return; // 방어
      // 로컬 미리보기 갱신
      setMainImage(url);
      // RHF 값 갱신(동일 값이면 스킵)
      if (getValues("mainImage") !== url) {
        setValue("mainImage", url, { shouldDirty: true });
      }
      setMainImageUploadError(null); // Clear error on success
    },
    onError: (error) => {
      setMainImageUploadError("업로드 실패: " + error.message);
    },
  });

    const propertyImagesMutation = useMutation({
      mutationFn: uploadImages,
      onSuccess: (data: { urls: string[] }) => {
        const urls = unique((data.urls || []).filter(isValidImgSrc));
        if (urls.length === 0) return;
  
        const newImages = unique([...propertyImages, ...urls]);
        setPropertyImages(newImages);
        setValue("subImage", newImages, { shouldDirty: true });
        setPropertyImagesUploadError(null); // Clear error on success
      },
      onError: (error) => {
        setPropertyImagesUploadError("업로드 실패: " + error.message);
      },
    });

    const adminImagesMutation = useMutation({
      mutationFn: uploadImages,
      onSuccess: (data: { urls: string[] }) => {
        const urls = unique((data.urls || []).filter(isValidImgSrc));
        if (urls.length === 0) return;
  
        const newImages = unique([...adminImages, ...urls]);
        setAdminImages(newImages);
        setValue("adminImage", newImages, { shouldDirty: true });
        setAdminImagesUploadError(null); // Clear error on success
      },
      onError: (error) => {
        setAdminImagesUploadError("업로드 실패: " + error.message);
      },
    });

    useEffect(() => {
    const isLoading = mainImageLoading || propertyImagesLoading.some(Boolean) || adminImagesLoading.some(Boolean);
    onImageLoadingStateChange?.(isLoading);
  }, [mainImageLoading, propertyImagesLoading, adminImagesLoading, onImageLoadingStateChange]);

  // ─────────────────────────────────────────────────────────
  // 파일 선택 핸들러
  // /api/image/upload : file
  // /api/image/uploads: file1(매물), file2(관리자)
  // ─────────────────────────────────────────────────────────
  const onPickMain = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMainImageUploadError(null);
    const f = e.target.files?.[0];
    if (!f) return;

    if (f.size > 10 * 1024 * 1024) {
      setMainImageUploadError(`10MB미만 사진을 업로드해주세요 (현재: ${(f.size / 1024 / 1024).toFixed(2)}MB)`);
      return;
    }

    const fd = new FormData();
    fd.append("file", f);
    // 필요 시 버킷/프리픽스 지정
    // fd.append("bucket", "build-public");
    // fd.append("prefix", "main");
    mainImageMutation.mutate(fd);
  };

  const onPickSubs = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPropertyImagesUploadError(null);
    const files = e.target.files;
    if (!files?.length) return;

    const totalSize = Array.from(files).reduce((acc, file) => acc + file.size, 0);
    if (totalSize > 10 * 1024 * 1024) {
      setPropertyImagesUploadError(`10MB미만 사진을 업로드해주세요 (현재: ${(totalSize / 1024 / 1024).toFixed(2)}MB)`);
      return;
    }

    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("file1", f));
    // fd.append("bucket", "build-public");
    // fd.append("prefix", "sub");
    propertyImagesMutation.mutate(fd);
  };

  const onPickAdmins = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdminImagesUploadError(null);
    const files = e.target.files;
    if (!files?.length) return;

    const totalSize = Array.from(files).reduce((acc, file) => acc + file.size, 0);
    if (totalSize > 10 * 1024 * 1024) {
      setAdminImagesUploadError(`10MB미만 사진을 업로드해주세요 (현재: ${(totalSize / 1024 / 1024).toFixed(2)}MB)`);
      return;
    }

    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("file2", f));
    // fd.append("bucket", "build-admin");
    // fd.append("prefix", "admin");
    adminImagesMutation.mutate(fd);
  };

  // ─────────────────────────────────────────────────────────
  // 삭제 핸들러(로컬 + RHF 동기화)
  // ─────────────────────────────────────────────────────────
  const clearMain = () => {
    setMainImage(null);
    setValue("mainImage", "", { shouldDirty: true });
  };

  const removeSubAt = (idx: number) => {
    const next = propertyImages.filter((_, i) => i !== idx);
    setPropertyImages(next);
    setValue("subImage", next, { shouldDirty: true });
  };

  const removeAdminAt = (idx: number) => {
    const next = adminImages.filter((_, i) => i !== idx);
    setAdminImages(next);
    setValue("adminImage", next, { shouldDirty: true });
  };

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-4 dark:bg-gray-800">
      {/* 대표 사진 */}
      <div className="mb-6">
        <label className="block text-lg sm:text-xl font-semibold dark:text-gray-300">매물 대표 사진</label>
        <input type="file" accept="image/*" onChange={onPickMain} className="mt-2 text-gray-700 dark:text-gray-300" />
        {mainImageUploadError && <div className="text-red-500 dark:text-red-400 text-sm mt-1">{mainImageUploadError}</div>}
        {mainImage && isValidImgSrc(mainImage) && (
          <div className="mt-3 flex items-center gap-3">
            <Image src={mainImage} alt="대표 사진" width={300} height={300} className="w-full max-w-[300px] h-auto" onLoad={() => setMainImageLoading(false)} onError={() => {
              setMainImageLoading(false);
              setMainImageError(true);
            }} />
            {mainImageError && <div className="text-red-500 dark:text-red-400">이미지 로드 실패</div>}
            <button
              type="button"
              className="px-3 py-1 rounded bg-red-500 text-white dark:bg-red-700 dark:hover:bg-red-800"
              onClick={clearMain}
            >
              삭제
            </button>
            {mainImageError && <button type="button" className="px-3 py-1 rounded bg-blue-500 text-white dark:bg-blue-700 dark:hover:bg-blue-800" onClick={() => setMainImage(getValues("mainImage"))}>
              재시도
            </button>}
          </div>
        )}
      </div>

      {/* 매물 사진들 */}
      <div className="mb-6">
        <label className="block text-lg sm:text-xl font-semibold dark:text-gray-300">매물 사진들</label>
        <input type="file" accept="image/*" multiple onChange={onPickSubs} className="mt-2 text-gray-700 dark:text-gray-300" />
        {propertyImagesUploadError && <div className="text-red-500 dark:text-red-400 text-sm mt-1">{propertyImagesUploadError}</div>}
        {propertyImagesError.some(Boolean) && <div className="text-red-500 dark:text-red-400">일부 이미지 로드 실패</div>}
        {propertyImagesError.some(Boolean) && <button type="button" className="px-3 py-1 rounded bg-blue-500 text-white dark:bg-blue-700 dark:hover:bg-blue-800" onClick={() => setPropertyImages(getValues("subImage") ? [...getValues("subImage")] : [])}>재시도</button>}
        {propertyImages.length > 0 && (
          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
            {propertyImages.filter(isValidImgSrc).map((img, idx) => (
              <div key={img + idx} className="relative">
                <Image src={img} alt={`매물 ${idx + 1}`} width={300} height={300} className="w-full h-auto" onLoad={() => {
                  setPropertyImagesLoading(prev => {
                    const next = [...prev];
                    next[idx] = false;
                    return next;
                  });
                }} onError={() => {
                  setPropertyImagesError(prev => {
                    const next = [...prev];
                    next[idx] = true;
                    return next;
                  });
                  setPropertyImagesLoading(prev => {
                    const next = [...prev];
                    next[idx] = false;
                    return next;
                  });
                }} />
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded"
                  onClick={() => removeSubAt(idx)}
                >
                  X
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 관리자 전용 사진들 */}
      <div className="mb-2">
        <label className="block text-lg sm:text-xl font-semibold dark:text-gray-300">관리자만 볼 수 있는 사진들</label>
        <input type="file" accept="image/*" multiple onChange={onPickAdmins} className="mt-2 text-gray-700 dark:text-gray-300" />
        {adminImagesUploadError && <div className="text-red-500 dark:text-red-400 text-sm mt-1">{adminImagesUploadError}</div>}
        {adminImagesError.some(Boolean) && <div className="text-red-500 dark:text-red-400">일부 이미지 로드 실패</div>}
        {adminImagesError.some(Boolean) && <button type="button" className="px-3 py-1 rounded bg-blue-500 text-white dark:bg-blue-700 dark:hover:bg-blue-800" onClick={() => setAdminImages(getValues("adminImage") ? [...getValues("adminImage")] : [])}>재시도</button>}
        {adminImages.length > 0 && (
          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
            {adminImages.filter(isValidImgSrc).map((img, idx) => (
              <div key={img + idx} className="relative">
                <Image src={img} alt={`관리자 ${idx + 1}`} width={300} height={300} className="w-full h-auto" onLoad={() => {
                  setAdminImagesLoading(prev => {
                    const next = [...prev];
                    next[idx] = false;
                    return next;
                  });
                }} onError={() => {
                  setAdminImagesError(prev => {
                    const next = [...prev];
                    next[idx] = true;
                    return next;
                  });
                  setAdminImagesLoading(prev => {
                    const next = [...prev];
                    next[idx] = false;
                    return next;
                  });
                }} />
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded"
                  onClick={() => removeAdminAt(idx)}
                >
                  X
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 블로그 url 주소 */}
      <div className="mb-6">
        <label htmlFor="blogUrl" className="block text-lg sm:text-xl font-semibold dark:text-gray-300">블로그 URL 주소</label>
        <input 
          id="blogUrl"
          type="url"
          {...register("blogUrl")}
          className="mt-2 text-gray-700 dark:text-gray-300 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        <Controller
          name="isBlogURL"
          control={control}
          render={({ field }) => (
            <div className="mt-2 flex items-center gap-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  onChange={() => field.onChange(true)}
                  checked={field.value === true}
                  className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">공개</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  onChange={() => field.onChange(false)}
                  checked={field.value === false}
                  className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">비공개</span>
              </label>
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default SaveImage;