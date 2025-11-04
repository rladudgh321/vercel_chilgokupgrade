"use client"

import React, { useState, useCallback } from 'react';

const Size = () => {
  const [openModal, setOpenModal] = useState(false);
  const [inputValueLeft, setInputValueLeft] = useState(0);
  const [inputValueRight, setInputValueRight] = useState(10000);

  const onChangeOpenModel = useCallback(() => {
    setOpenModal(true);
  }, []);

  const onChangeCloseModel = useCallback(() => {
    setOpenModal(false);
  }, []);

  const onChangeLeft = useCallback((value: number) => {
    setInputValueLeft(value);
  }, []);

  const onChangeRight = useCallback((value: number) => {
    setInputValueRight(value);
  }, []);

  const onSliderChange = useCallback((values: [number, number]) => {
    const [left, right] = values;
    setInputValueLeft(left);
    setInputValueRight(right);
  }, []);

  return (
    <>
      <button
        onClick={onChangeOpenModel}
        className="px-4 py-2 bg-blue-500 text-white rounded-md flex items-center space-x-2 hover:bg-blue-600"
      >
        <span>Size</span>
        v
      </button>

      {openModal && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="text-sm mb-4">
              <span>실면적 검색</span>
              <span className="text-xs text-gray-500">단위: m2</span>
            </div>

            {/* Input Range */}
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="number"
                min={0}
                max={10000}
                value={inputValueLeft}
                onChange={(e) => onChangeLeft(Number(e.target.value))}
                className="p-2 border border-gray-300 rounded-md w-24"
              />
              <span>~</span>
              <input
                type="number"
                min={0}
                max={10000}
                value={inputValueRight}
                onChange={(e) => onChangeRight(Number(e.target.value))}
                className="p-2 border border-gray-300 rounded-md w-24"
              />
            </div>

            {/* Slider */}
            <div className="mb-4">
              <input
                type="range"
                min="0"
                max="10000"
                value={inputValueLeft}
                onChange={(e) => onSliderChange([Number(e.target.value), inputValueRight])}
                className="w-full h-2 bg-gray-200 rounded-lg"
              />
              <input
                type="range"
                min="0"
                max="10000"
                value={inputValueRight}
                onChange={(e) => onSliderChange([inputValueLeft, Number(e.target.value)])}
                className="w-full h-2 bg-gray-200 rounded-lg mt-2"
              />
            </div>

            {/* Close Button */}
            <div className="flex justify-end">
              <button
                onClick={onChangeCloseModel}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Size;
