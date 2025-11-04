"use client"

import { useFormContext } from "react-hook-form";

const LandOption = () => {
  const { register } = useFormContext();
  return (
    <>
      {/* BuyType */}
      <div className="space-x-2">
        <select {...register('buyType')}
          className="w-32 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="no_selected">
            매물 종류
          </option>
          <option value="apart">아파트</option>
          <option value="villa">신축빌라</option>
          <option value="one_two_three_room">원/투/쓰리룸</option>
          <option value="office">사무실</option>
          <option value="store">상가</option>
          <option value="office_hotel">오피스텔</option>
        </select>
      </div>

      {/* Floor */}
      <div className="flex items-center space-x-2">
        <input
          className="w-20 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="number"
          min="1"
          max="100"
          {...register('floor')}
        />
        <span>층</span>
      </div>

      {/* room */}
      <div className="flex items-center space-x-2">
        <span>방 갯수</span>
        <input
          className="w-20 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="number"
          min="1"
          max="100"
          {...register('room')}
        />
      </div>

      {/* restroom */}
      <div className="flex items-center space-x-2">
        <span>화장실 갯수</span>
        <input
          className="w-20 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="number"
          min="1"
          max="100"
          {...register('restroom')}
        />
      </div>
    </>
  );
};

export default LandOption;