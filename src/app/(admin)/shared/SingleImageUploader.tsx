'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import imageCompression from "browser-image-compression";

interface SingleImageUploaderProps {
  title: string;
  getApiEndpoint: string;
  updateApiEndpoint: string;
  uploadApiEndpoint: string;
  imageMaxWidthOrHeight?: number;
}

const SingleImageUploader = ({ title, getApiEndpoint, updateApiEndpoint, uploadApiEndpoint, imageMaxWidthOrHeight = 200 }: SingleImageUploaderProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImage = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiEndpoint);
      const result = await response.json();
      if (result.ok && result.data) {
        setImageUrl(result.data.logoUrl);
      }
    } catch (e) {
      setError('데이터를 불러오는 데 실패했습니다.');
    }
    setLoading(false);
  }, [getApiEndpoint]);

  useEffect(() => {
    fetchImage();
  }, [fetchImage]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: imageMaxWidthOrHeight,
        useWebWorker: true,
        fileType: "image/webp",
        quality: 0.8,
      };
      const compressedFile = await imageCompression(file, options);

      const formData = new FormData();
      formData.append('file', compressedFile);

      // 1. Upload to S3
      const uploadResponse = await fetch(uploadApiEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('이미지 업로드에 실패했습니다.');
      }

      const uploadResult = await uploadResponse.json();
      const { imageUrl, imageName } = uploadResult.data;

      // 2. Update database with new URL
      const updateResponse = await fetch(updateApiEndpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoUrl: imageUrl, logoName: imageName }),
      });

      if (!updateResponse.ok) {
        throw new Error('데이터베이스 업데이트에 실패했습니다.');
      }

      setImageUrl(imageUrl);
      alert('로고가 성공적으로 변경되었습니다.');

    } catch (e: any) {
      setError(e.message || '로고 변경 중 오류가 발생했습니다.');
    }
  }, [uploadApiEndpoint, updateApiEndpoint, imageMaxWidthOrHeight]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': [] }, 
    multiple: false 
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${isDragActive ? 'border-blue-500' : 'border-gray-300'}`}>
        <input {...getInputProps()} />
        <p>새 로고를 여기에 드래그하거나 클릭하여 선택하세요.</p>
      </div>

      {imageUrl && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold">현재 로고</h2>
          <div className="relative w-48 h-48 mt-2">
            <Image src={imageUrl} alt="Current Logo" fill objectFit="contain" />
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleImageUploader;
