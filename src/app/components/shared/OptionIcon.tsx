'use client';

import React from 'react';
import Image from 'next/image';

interface OptionIconProps {
  option: {
    name: string;
    imageUrl?: string;
  };
  className?: string; // Add className prop
}

const iconMap: Record<string, string> = {
  // Assuming these are the option names from the database
  '주차가능': '/img/2/parkinglot.png',
  '주차장': '/img/2/parkinglot.png',
  '애완동물 가능': '/img/2/pet.png',
  '반려동물': '/img/2/pet.png',
  '대출가능': '/img/2/loan.png',
  '융자': '/img/2/loan.png',
  '신축': '/img/2/new.png',
  '원룸': '/img/2/oneroom.png',
  '옥탑': '/img/2/rooftop.png',
  '역세권': '/img/2/train.png',
  '복층': '/img/2/upper.png',
  '엘리베이터': '/img/2/upper.png', // Placeholder, as I don't have a specific elevator icon
};

const OptionIcon = ({ option, className = "" }: OptionIconProps) => { // Destructure className with default
  if (!option || !option.name) {
    return null;
  }

  const iconSrc = Object.keys(iconMap).find(key => option.name.includes(key));
  const iconPath = option.imageUrl || (iconSrc ? iconMap[iconSrc] : null);

  if (!iconPath) {
    // Render a default representation if no icon is found
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-gray-200 mb-1" />
        <span className={`text-xs text-gray-700 ${className}`}>{option.name}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative w-12 h-12 mb-1">
        <Image src={iconPath} alt={option.name} fill objectFit="contain" />
      </div>
      <span className={`text-xs text-gray-700 ${className}`}>{option.name}</span>
    </div>
  );
};

export default OptionIcon;
