"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

const fetchSettings = async () => {
  const res = await fetch("/api/admin/search-bar-settings");
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await res.json();
  return data.data;
};

const updateSettings = async (settings: any) => {
  const res = await fetch("/api/admin/search-bar-settings", {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await res.json();
  return data.data;
};

const settingLabels: { [key: string]: string } = {
  showKeyword: "검색어 입력창",
  showPropertyType: "매물 종류",
  showDealType: "거래 유형",
  showPriceRange: "금액",
  showAreaRange: "면적",
  showTheme: "테마",
  showRooms: "방 개수",
  showFloor: "층수",
  showBathrooms: "화장실 개수",
  showSubwayLine: "지하철 호선",
};

const CategorySettingsPage = () => {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<any>({});

  const { data, isLoading, isError } = useQuery({
    queryKey: ["search-bar-settings"],
    queryFn: fetchSettings,
  });

  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["search-bar-settings"] });
      // Optionally, show a success notification
      alert("설정이 저장되었습니다.");
    },
    onError: () => {
      // Optionally, show an error notification
      alert("설정 저장에 실패했습니다.");
    },
  });

  useEffect(() => {
    if (data) {
      setSettings(data);
    }
  }, [data]);

  const handleToggle = (key: string) => {
    setSettings((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    mutation.mutate(settings);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">검색창 표시 설정</h1>
        <div>로딩 중...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">검색창 표시 설정</h1>
        <div>오류가 발생했습니다.</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen dark:bg-gray-900">
      <div className="max-w-4xl mx-auto bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md dark:bg-gray-800">
        <h1 className="text-xl sm:text-2xl font-bold mb-2 text-gray-800 dark:text-gray-200">검색창 표시 설정</h1>
        <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 dark:text-gray-400">사용자 페이지에 표시될 검색 필터를 선택하세요.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {Object.keys(settingLabels).map((key) => (
            <div
              key={key}
              className="flex items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors dark:border-gray-700 dark:hover:bg-gray-700"
            >
              <span className="font-medium text-gray-700 text-sm sm:text-base dark:text-gray-300">{settingLabels[key]}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[key] || false}
                  onChange={() => handleToggle(key)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>

        <div className="mt-6 sm:mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={mutation.isPending}
            className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:bg-gray-400 disabled:cursor-not-allowed dark:bg-blue-700 dark:hover:bg-blue-800 dark:disabled:bg-gray-600"
          >
            {mutation.isPending ? "저장 중..." : "저장하기"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategorySettingsPage;
