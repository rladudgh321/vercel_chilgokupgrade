"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { workInfoSchema, WorkInfoFormData } from "./schema";

const postWorkInfo = async (data: WorkInfoFormData): Promise<any> => {
  const response = await fetch("/api/admin/website-info", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    // 서버가 JSON 에러 응답을 보낼 경우 메시지 추출
    let errorMsg = "Failed to save data";
    try {
      const err = await response.json();
      errorMsg = err?.error || err?.message || errorMsg;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }
  return response.json();
};

const WebsiteInfoForm = ({ initialData }: { initialData: WorkInfoFormData | null }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<WorkInfoFormData>({
    resolver: zodResolver(workInfoSchema),
    values: initialData ?? ({} as WorkInfoFormData),
  });

  const onSubmit: SubmitHandler<WorkInfoFormData> = async (data) => {
    try {
      await postWorkInfo(data);
      // 서버 저장 후 폼을 갱신된 값으로 리셋(선택적)
      reset(data);
      alert("정보가 성공적으로 저장되었습니다.");
    } catch (error: any) {
      console.error("Error saving data:", error);
      alert(`오류가 발생했습니다: ${error?.message || error}`);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">회사명</label>
          <input
            id="companyName"
            {...register("companyName")}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="owner" className="block text-sm font-medium text-gray-700">대표자</label>
          <input
            id="owner"
            {...register("owner")}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="businessId" className="block text-sm font-medium text-gray-700">사업자번호</label>
          <input
            id="businessId"
            {...register("businessId")}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">주소</label>
          <input
            id="address"
            {...register("address")}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">전화</label>
          <input
            id="phone"
            {...register("phone")}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">휴대폰</label>
          <input
            id="mobile"
            {...register("mobile")}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">이메일</label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? "저장 중..." : "저장"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WebsiteInfoForm;
