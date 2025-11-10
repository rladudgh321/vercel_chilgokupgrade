"use client";

import React, { useState, useEffect } from "react";
import { clsx } from "clsx";

const ToggleSwitch = ({
  toggle = false,
  id,
  onToggle,
  className,
  disabled = false,
}: {
  toggle?: boolean;
  id: string;
  onToggle?: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}) => {
  const [isChecked, setIsChecked] = useState(toggle);

  useEffect(() => {
    setIsChecked(toggle);
  }, [toggle]);

  const handleToggle = () => {
    if (disabled) return;
    const newValue = !isChecked;
    setIsChecked(newValue);
    onToggle?.(newValue);
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
          disabled={disabled}
        />
        <label
          htmlFor={id}
          className={clsx(
            "flex justify-between items-center cursor-pointer w-20 h-10 rounded-full bg-gray-300 peer-checked:bg-blue-500 transition-colors duration-300",
            "peer-disabled:cursor-not-allowed peer-disabled:bg-gray-400"
          )}
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
