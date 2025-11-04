"use client";

import React, { useState } from "react";
import { clsx } from "clsx";

const ToggleSwitch = ({
  toggle = false,
  id,
  onToggle,
  className
}: {
  toggle?: boolean;
  id: string;
  onToggle?: (checked: boolean) => void;
  className?: string;
}) => {
  const [isChecked, setIsChecked] = useState(toggle);

  const handleToggle = () => {
    const newValue = !isChecked;
    setIsChecked(newValue); // 로컬 상태 즉시 업데이트
    onToggle?.(newValue);   // 부모로 상태 전달
  };

  return (
    <div className={clsx("flex justify-center items-center space-x-4", className)}>
      <div className="relative">
        <input
          type="checkbox"
          id={id}
          checked={isChecked}
          onChange={handleToggle}
          className="peer hidden"
        />
        <label
          htmlFor={id}
          className="flex justify-between items-center cursor-pointer w-20 h-10 rounded-full bg-gray-300 peer-checked:bg-blue-500 transition-colors duration-300"
        >
          <span
            className={clsx(
              "text-sm text-gray-700 transition-opacity duration-300 z-10 absolute right-4",
              !isChecked ? "opacity-100" : "opacity-0"
            )}
          >
            Off
          </span>
          <span
            className={clsx(
              "text-sm text-white transition-opacity duration-300 z-10 absolute left-4",
              isChecked ? "opacity-100" : "opacity-0"
            )}
          >
            On
          </span>
          <span
            style={isChecked ? { translate: "40px" } : undefined}
            className="absolute top-1 left-1 w-8 h-8 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out"
          ></span>
        </label>
      </div>
    </div>
  );
};

export default ToggleSwitch;
