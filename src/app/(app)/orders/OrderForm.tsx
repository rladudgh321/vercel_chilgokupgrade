"use client";

import { useMemo, useState } from "react";

type PropertyType = { id: number; name: string };
type BuyType = { id: number; name: string };

interface OrderFormProps {
  propertyTypes: PropertyType[];
  buyTypes: BuyType[];
  isBanned: boolean;
}

export default function OrderForm({ propertyTypes, buyTypes, isBanned }: OrderFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: "구해요",
    author: "",
    contact: "",
    region: "",
    estimatedAmount: "",
    propertyType: "",
    transactionType: "",
    title: "",
    description: "",
  });

  // 옵션 파생값: 메모만(불필요 상태 X)
  const propertyTypeOptions = useMemo(() => propertyTypes, [propertyTypes]);
  const buyTypeOptions = useMemo(() => buyTypes, [buyTypes]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => (prev[name as keyof typeof prev] === value ? prev : { ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isBanned) {
      alert("귀하는 양식 제출이 제한되었습니다.");
      return;
    }
    if (submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/inquiries/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        // 모바일 백그라운드 전환 대비
        keepalive: true,
      });

      if (!res.ok) {
        const err = await safeJson(res);
        alert(`의뢰 접수에 실패했습니다: ${err?.message ?? "Unknown error"}`);
        return;
      }

      alert("의뢰가 성공적으로 접수되었습니다.");
      // 폼 초기화(불필요 렌더 최소화를 위해 한 번에 리셋)
      setFormData({
        category: "구해요",
        author: "",
        contact: "",
        region: "",
        estimatedAmount: "",
        propertyType: "",
        transactionType: "",
        title: "",
        description: "",
      });
    } catch (err) {
      console.error("Failed to submit order", err);
      alert("의뢰 접수 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isBanned) {
    return (
      <div className="max-w-4xl mx-auto bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold text-red-600">접근 제한</h2>
        <p className="text-gray-700 mt-4">귀하의 IP 주소에서는 이 양식을 제출할 수 없습니다.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md">
      {/* 구분 */}
      <div className="mb-6">
        <label className="block text-gray-700 font-bold mb-2">구분</label>
        <div className="flex flex-col sm:flex-row flex-wrap gap-4">
          {["구해요", "팔아요", "기타"].map(val => (
            <label key={val} className="flex items-center">
              <input
                type="radio"
                name="category"
                value={val}
                checked={formData.category === val}
                onChange={handleChange}
                className="mr-2"
              />
              {val}
            </label>
          ))}
        </div>
      </div>

      {/* 작성자/연락처 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <TextInput label="작성자" id="author" name="author" value={formData.author} onChange={handleChange} required />
        <TextInput
          label="연락처"
          id="contact"
          name="contact"
          value={formData.contact}
          onChange={handleChange}
          placeholder="'-' 없이 숫자만 입력"
          required
        />
      </div>

      {/* 지역 */}
      <div className="mb-6">
        <TextInput
          label="의뢰 지역"
          id="region"
          name="region"
          value={formData.region}
          onChange={handleChange}
          placeholder="예: 칠곡군 석적읍"
          required
        />
      </div>

      {/* 금액 */}
      <div className="mb-6">
        <TextInput
          label="희망 금액"
          id="estimatedAmount"
          name="estimatedAmount"
          value={formData.estimatedAmount}
          onChange={handleChange}
          placeholder="예: 3억 5천만원"
          required
        />
      </div>

      {/* 셀렉트 2개 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Select
          label="매물 종류"
          id="propertyType"
          name="propertyType"
          value={formData.propertyType}
          onChange={handleChange}
          options={propertyTypeOptions.map(t => ({ value: t.name, label: t.name, key: String(t.id) }))}
          required
        />
        <Select
          label="거래 유형"
          id="transactionType"
          name="transactionType"
          value={formData.transactionType}
          onChange={handleChange}
          options={buyTypeOptions.map(t => ({ value: t.name, label: t.name, key: String(t.id) }))}
          required
        />
      </div>

      {/* 제목/내용 */}
      <div className="mb-6">
        <TextInput label="제목" id="title" name="title" value={formData.title} onChange={handleChange} required />
      </div>
      <div className="mb-6">
        <Textarea
          label="상세 내용"
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={6}
          required
        />
      </div>

      {/* 제출 */}
      <div className="text-center">
        <button
          type="submit"
          className="w-full md:w-auto bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-400"
          disabled={isBanned || submitting}
          aria-busy={submitting}
        >
          {submitting ? "등록 중..." : "의뢰하기"}
        </button>
      </div>
    </form>
  );
}

/* ——— 작은 프리미티브 컴포넌트들 (렌더 가독성 + 재사용) ——— */

function TextInput({
  label,
  id,
  name,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-gray-700 font-bold mb-2">
        {label}
      </label>
      <input
        type="text"
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 sm:px-4 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

function Textarea({
  label,
  id,
  name,
  value,
  onChange,
  rows,
  required,
}: {
  label: string;
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-gray-700 font-bold mb-2">
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows ?? 6}
        className="w-full px-3 py-2 sm:px-4 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        required={required}
      />
    </div>
  );
}

function Select({
  label,
  id,
  name,
  value,
  onChange,
  options,
  required,
}: {
  label: string;
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ key: string; value: string; label: string }>;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-gray-700 font-bold mb-2">
        {label}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 sm:px-4 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        required={required}
      >
        <option value="" disabled>
          선택하세요
        </option>
        {options.map(opt => (
          <option key={opt.key} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* 안전한 JSON 파싱 */
async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
