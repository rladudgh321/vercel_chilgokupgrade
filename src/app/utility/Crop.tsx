"use client";

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Cropper } from "react-advanced-cropper";
import "react-advanced-cropper/dist/style.css";
import CloudUpload from "../components/svg/CloudUpload";
import Image from "next/image";

const ImgCrop = () => {
  const [image, setImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null); // Blob URL
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [, setFile] = useState<File | null>(null);
  const [fileName] = useState<string>("cropped-image");

  // 파일을 드래그 앤 드롭하여 업로드 처리
  const handleDrop = (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string); // 이미지를 state에 저장
        setIsModalOpen(true); // 모달 열기
      };
      reader.readAsDataURL(selectedFile);
      setFile(selectedFile);
    }
  };

  // Dropzone 훅 사용
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleDrop,
    accept: { "image/*": [] }, // 이미지 파일만 받기
  });

  // 이미지 크롭 상태 관리
  const onCropChange = (cropper: any) => {
    const canvas = cropper.getCanvas();
    if (canvas) {
      const croppedBase64 = canvas.toDataURL();
      setCroppedImage(croppedBase64);

      // Blob URL로 변환
      canvas.toBlob((blob: any) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setCroppedImageUrl(url); // Blob URL 상태 설정
        }
      }, "image/webp");
    }
  };

  // 모달 닫기 및 상태 초기화
  const closeModal = () => {
    setIsModalOpen(false);
    setCroppedImage(null); // 크롭된 이미지 초기화
    setCroppedImageUrl(null); // Blob URL 초기화
  };

  // OK 버튼 클릭 시 모달 닫기
  const handleOkClick = () => {
    setIsModalOpen(false);
  };

  // 잘라낸 이미지를 WebP 형식으로 다운로드
  const downloadCroppedImage = () => {
    if (!croppedImageUrl) return;

    const link = document.createElement("a");
    link.href = croppedImageUrl; // Blob URL 사용
    link.download = `${fileName}.${Date.now()}.webp`; // 파일 이름 지정
    link.click();
  };

  return (
    <div className="photo-cropper">
      <div className="upload-container mb-4">
        <div
          {...getRootProps()}
          className="border p-4 rounded-md bg-gray-200 cursor-pointer flex flex-col justify-center items-center"
        >
          <input {...getInputProps()} />
          <CloudUpload />
          <p className="text-gray-600">매물 업로드</p>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="modal-content bg-white p-6 rounded-md w-1/2">
            <h2 className="text-xl font-bold mb-4">Crop Your Image</h2>
            <div className="cropper-container w-full h-80 mb-4 bg-gray-200">
              <Cropper
                src={image as string}
                onChange={onCropChange}
                className="cropper"
                canvas={true}
                transitions={true}
                minWidth={50}
                minHeight={50}
                aspectRatio={() => 1 / 1}
              />
            </div>

            <div className="modal-actions flex justify-between">
              <button
                onClick={handleOkClick}
                className="ok-button bg-blue-500 text-white py-2 px-4 rounded-md"
                disabled={!croppedImage}
              >
                OK
              </button>
              <button
                onClick={closeModal}
                className="close-button bg-gray-500 text-white py-2 px-4 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 파일명 입력 */}
      {croppedImageUrl && (
        <div className="cropped-image-preview mt-4">
          <h3 className="text-lg font-semibold mb-2">Cropped Image Preview:</h3>
          <div className="flex justify-center">
            <Image
              src={croppedImageUrl}
              alt="Cropped"
              width={400}
              height={400}
            />
          </div>
          <div className="download-button mt-2">
            <button
              onClick={downloadCroppedImage}
              className="bg-green-500 text-white py-2 px-4 rounded-md"
            >
              Download as WebP
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImgCrop;
