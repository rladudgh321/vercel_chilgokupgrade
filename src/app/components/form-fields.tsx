"use client";

import React, { lazy, Suspense } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { ko } from "date-fns/locale";
import { clsx } from "clsx";
import "react-datepicker/dist/react-datepicker.css";

const DatePicker = lazy(() => import('react-datepicker'));

/* =========================
   공통 스타일/컴포넌트
   ========================= */
export const buttonBaseStyle = "border p-2 px-4 text-sm font-medium rounded-md cursor-pointer shadow-md transition-all duration-200";
export const buttonActiveStyle = "bg-blue-600 text-white border-blue-600";
export const buttonInactiveStyle = "bg-white text-gray-500 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600";

type InputFieldProps = {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  className?: string;
  isDatePicker?: boolean;
  min?: number;
};

/* ---------- 유틸 함수 ---------- */
// Date -> "YYYY-MM-DD"
export const dateToDateOnlyString = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// value (string | Date | null | undefined) -> Date | null (로컬 자정으로 생성)
export const parseValueToDate = (val: any): Date | null => {
  if (!val) return null;

  if (typeof val === 'string') {
    const datePart = val.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    if (year && month && day) {
      return new Date(year, month - 1, day);
    }
  }

  if (val instanceof Date) {
    return new Date(val.getFullYear(), val.getMonth(), val.getDate());
  }

  // Fallback for other types or failed parsing
  try {
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
  } catch {}

  return null;
};

export const toDate = (v: unknown): Date | null => {
  if (!v) return null;

  if (typeof v === 'string') {
    const datePart = v.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    if (year && month && day) {
      return new Date(year, month - 1, day);
    }
  }

  if (v instanceof Date) {
    return new Date(v.getFullYear(), v.getMonth(), v.getDate());
  }

  // Fallback for other types or failed parsing
  try {
    const d = new Date(v);
    if (!isNaN(d.getTime())) {
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
  } catch {}

  return null;
};

// Date|null -> 'YYYY-MM-DD' 또는 ''
export const toYMD = (d: Date | null): string => {
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const InputField = ({
  label,
  name,
  type = "text",
  placeholder = "",
  className = "",
  isDatePicker = false,
  min,
}: InputFieldProps) => {
  const { control } = useFormContext();
  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      <Controller
        control={control}
        name={name}
        render={({ field }) =>
          isDatePicker ? (
            <Suspense>
            <DatePicker
              id={name}
              selected={parseValueToDate(field.value)}
              onChange={(date: Date | null) => {
                if (date) {
                  // 사용자 선택한 로컬 날짜를 "YYYY-MM-DD" 형식 문자열로 저장
                  const only = dateToDateOnlyString(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
                  field.onChange(only);
                } else {
                  field.onChange(null);
                }
              }}
              placeholderText={placeholder || "날짜 선택"}
              dateFormat="yyyy/MM/dd"
              locale={ko}
              showYearDropdown
              showMonthDropdown
              scrollableYearDropdown
              className={clsx(
                "mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white",
                className
              )}
              portalId="react-datepicker-portal"
            />
            </Suspense>
          ) : (
            <input
              id={name}
              type={type}
              placeholder={placeholder}
              min={min}
              className={clsx(
                "mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white",
                className
              )}
              {...field}
              value={field.value === null || field.value === undefined ? "" : field.value}
              onChange={(e) => {
                const val = e.target.value;
                field.onChange(val === "" ? null : val);
              }}
            />
          )
        }
      />
    </div>
  );
};

export const SelectField = ({
  label,
  name,
  options,
  placeholder,
  className = "",
}: {
  label: string;
  name: string;
  options: string[];
  placeholder?: string;
  className?: string;
}) => {
  const { control } = useFormContext();

  return (
    <div className="flex flex-col">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <select
            {...field}
            onChange={(e) => {
              if (e.target.value === "") {
                field.onChange(null);
              } else {
                field.onChange(e.target.value);
              }
            }}
            value={field.value || ""}
            className={clsx(
              "mt-1 block w-full p-2 sm:p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white",
              className
            )}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {(options || []).map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </select>
        )}
      />
    </div>
  );
};