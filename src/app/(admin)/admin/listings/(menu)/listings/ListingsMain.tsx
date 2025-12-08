"use client";
import type { SortKey } from "./ListingsShell";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import Link from "next/link";
import { clsx } from "clsx";

import Pagination from "@/app/components/shared/Pagination";
import ToggleSwitch from "@/app/components/admin/listings/ToggleSwitch";
import AddressVisibility from "@/app/components/admin/listings/AddressVisibility";
import SearchIcon from "@svg/Search";

import { BuildDeleteSome, BuildFindAllAdmin, toggleBuild, updateConfirmDate, patchConfirmDateToToday } from "@/app/apis/build";
import { WorkInfoFindOne } from "@/app/apis/workinfo";
import { IBuild } from "@/app/interface/build";
import formatFullKoreanMoney from "@/app/utility/NumberToKoreanMoney";
import { formatYYYYMMDD } from "@/app/utility/koreaDateControl";
import { printPhotoVersion } from "./shared/PrintPhotoVersion";
import AreaInfo from "./shared/AreaInfo";

type SearchFormValues = { keyword: string };

interface ListingsMainProps {
  ListingsData: {
    currentPage: number;
    data: Array<IBuild>;
    ok: boolean;
    totalItems: number;
    totalPages: number;
  };
  sortKey: SortKey;
}

type PageData = {
  ok: boolean;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  data: IBuild[];
};

const LIMIT = 10;

const ListingsMain = ({ ListingsData, sortKey }: ListingsMainProps) => {
  const queryClient = useQueryClient();

  // 검색 폼
  const methods = useForm<SearchFormValues>({ defaultValues: { keyword: "" } });
  const { register, handleSubmit } = methods;
  const [searchKeyword, setSearchKeyword] = useState("");

  // 페이지
  const [page, setPage] = useState(ListingsData.currentPage);

  // 선택 삭제 상태
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // 메뉴 상태
  const [menuRowId, setMenuRowId] = useState<number | null>(null); // 확인일 드롭다운
  const [printMenuRowId, setPrintMenuRowId] = useState<number | null>(null); // 프린트 드롭다운
  const today = () => {
    // 한국 시간대 기준으로 오늘 날짜를 YYYY-MM-DD 형식으로 생성
    const now = new Date();
    const koreanTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
    return koreanTime.toISOString().split('T')[0];
  }

  const formatPriceWithDisplay = (price: number | undefined | null, priceDisplay: string | undefined | null) => {
    if (price === undefined || price === null) return "";
    let formattedPrice = formatFullKoreanMoney(price);
    if (priceDisplay === "비공개") {
      formattedPrice = `${formattedPrice} (비공개)`;
    } else if (priceDisplay === "협의가능") {
      formattedPrice = `${formattedPrice} (협의가능)`;
    }
    return formattedPrice;
  };

  // Query Key
  const qk = 
    () => ["builds", page, LIMIT, (searchKeyword ?? "").trim(), sortKey]
  const shouldUseInitial = 
    () =>
      (ListingsData?.currentPage ?? 1) === page &&
      (searchKeyword ?? "") === "" &&
      sortKey === "recent",


  const { data: workInfoData } = useQuery({
    queryKey: ["workinfo"],
    queryFn: WorkInfoFindOne,
    staleTime: Infinity, // This data doesn't change often
  });

  // 목록 조회
  const { data, isLoading, isError } = useQuery({
    queryKey: qk,
    queryFn: () => BuildFindAllAdmin(page, LIMIT, searchKeyword, undefined, sortKey),
    placeholderData: keepPreviousData,
    initialData: shouldUseInitial ? ListingsData : undefined,
    staleTime: 10_000,
  });

  const rows = () => {
    if (!Array.isArray(data?.data)) return [];
    return data.data as IBuild[];
  };

  // 선택 체크박스 계산은 정렬된 결과 기준
  const allIdsOnPage = 
    () => rows.map((it) => Number(it.id)).filter(Number.isFinite);
    
  const allOnThisPageChecked =
    allIdsOnPage.length > 0 && allIdsOnPage.every((id) => selectedIds.includes(id));
  const someOnThisPageChecked = allIdsOnPage.some((id) => selectedIds.includes(id));

  const toggleSelect = (id: number, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? Array.from(new Set([...prev, id])) : prev.filter((x) => x !== id)
    );
  };
  const toggleSelectAllOnPage = (checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) return Array.from(new Set([...prev, ...allIdsOnPage]));
      const remove = new Set(allIdsOnPage);
      return prev.filter((id) => !remove.has(id));
    });
  };

  // 삭제 뮤테이션 (낙관적 업데이트)
  const deleteSomeMutation = useMutation({
    mutationFn: (ids: number[]) => BuildDeleteSome(ids),
    onMutate: async (ids) => {
      setIsDeleting(true);
      await queryClient.cancelQueries({ queryKey: qk });
      const prev = queryClient.getQueryData<typeof ListingsData>(qk);
      if (prev) {
        const nextTotalItems = Math.max(0, (prev.totalItems ?? 0) - ids.length);
        const next = {
          ...prev,
          data: prev.data.filter((item: any) => !ids.includes(Number(item.id))),
          totalItems: nextTotalItems,
          totalPages: Math.max(1, Math.ceil(nextTotalItems / LIMIT)),
          currentPage: page,
        };
        queryClient.setQueryData(qk, next);
      }
      setSelectedIds((prevSel) => prevSel.filter((id) => !ids.includes(id)));
      return { prev };
    },
    onError: (_err, _ids, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(qk, ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["builds"] });
      setIsDeleting(false);
    },
  });

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      alert("삭제할 항목을 선택하세요.");
      return;
    }
    if (!window.confirm(`${selectedIds.length}건을 삭제하시겠습니까?`)) return;
    try {
      const res = await deleteSomeMutation.mutateAsync([...selectedIds]);
      alert(res.message ?? "삭제 완료");
    } catch (e: any) {
      alert(e?.message ?? "삭제 실패");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      const res = await deleteSomeMutation.mutateAsync([id]);
      alert(res.message ?? "삭제 완료");
    } catch (e: any) {
      alert(e?.message ?? "삭제 실패");
    }
  };


  // 검색
  const onSubmit = handleSubmit((formData) => {
    setSearchKeyword(formData.keyword);
    setPage(1);
  });

  // 확인일 조작 (서버 동기화)
  const addConfirmDate = (id: number) => {
    // PUT API를 사용하여 오늘 날짜로 추가
    updateConfirmDate(id, { confirmDate: today })
      .then(() => {
        // 성공 시 쿼리 무효화하여 데이터 새로고침
        queryClient.invalidateQueries({ queryKey: ["builds"] });
      })
      .catch((error: any) => {
        alert(error.message || "확인일 추가 실패");
      });
  };
  
  const updateConfirmDateToToday = (id: number) => {
    // PATCH API를 사용하여 오늘 날짜로 갱신
    patchConfirmDateToToday(id)
      .then(() => {
        // 성공 시 쿼리 무효화하여 데이터 새로고침
        queryClient.invalidateQueries({ queryKey: ["builds"] });
        setMenuRowId(null);
      })
      .catch((error: any) => {
        alert(error.message || "확인일 갱신 실패");
      });
  };
  
  const deleteConfirmDate = (id: number) => {
    // PUT API를 사용하여 확인일 삭제
    updateConfirmDate(id, { confirmDate: null })
      .then(() => {
        // 성공 시 쿼리 무효화하여 데이터 새로고침
        queryClient.invalidateQueries({ queryKey: ["builds"] });
        setMenuRowId(null);
      })
      .catch((error: any) => {
        alert(error.message || "확인일 삭제 실패");
      });
  };
  
  const editConfirmDate = (id: number) => {
    const input = window.prompt("2026-01-01 형식으로 작성해주세요");
    if (!input) return;
    const valid = /^\d{4}-\d{2}-\d{2}$/.test(input);
    if (!valid) return alert("형식이 올바르지 않습니다. 예: 2026-01-01");
    
    // 간단한 날짜 검증
    const [year, month, day] = input.split('-').map(Number);
    const dt = new Date(year, month - 1, day);
    if (dt.getFullYear() !== year || dt.getMonth() !== month - 1 || dt.getDate() !== day) {
      return alert("존재하지 않는 날짜입니다. 예: 2026-01-01");
    }
    
    // PUT API를 사용하여 사용자 입력 날짜로 수정
    updateConfirmDate(id, { confirmDate: input })
      .then(() => {
        // 성공 시 쿼리 무효화하여 데이터 새로고침
        queryClient.invalidateQueries({ queryKey: ["builds"] });
        setMenuRowId(null);
      })
      .catch((error: any) => {
        alert(error.message || "확인일 수정 실패");
      });
  };



  if (isLoading) return <p>로딩 중...</p>;
  if (isError) return <p>데이터를 불러오는 중 오류가 발생했습니다.</p>;

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <div className="w-full sm:max-w-xs flex items-center">
          <form className="flex h-8 w-full" onSubmit={onSubmit}>
            <div className="border border-slate-500 rounded-l-xl w-full">
              <input
                {...register("keyword")}
                type="text"
                placeholder="매물번호 또는 주소"
                className="h-full px-2 w-full rounded-l-xl"
              />
            </div>
            <button type="submit">
              <SearchIcon className="w-8 bg-slate-400 rounded-r-xl p-1 h-full" />
            </button>
          </form>
        </div>

        <div>
          <button
            onClick={handleBulkDelete}
            disabled={isDeleting || selectedIds.length === 0}
            className={clsx(
              "text-sm text-white px-3 py-2 rounded-lg shadow transition duration-200 w-full sm:w-auto",
              selectedIds.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-400"
            )}
          >
            {isDeleting ? "삭제 중..." : `선택 삭제 (${selectedIds.length})`}
          </button>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="w-full table-auto text-center">
          <thead className="bg-slate-600 text-white hidden md:table-header-group">
            <tr>
              <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium">
                <input
                  type="checkbox"
                  checked={allOnThisPageChecked}
                  ref={(el) => {
                    if (el)
                      el.indeterminate =
                        !allOnThisPageChecked && someOnThisPageChecked;
                  }}
                  onChange={(e) =>
                    toggleSelectAllOnPage(e.currentTarget.checked)
                  }
                  aria-label="이 페이지 전체 선택"
                />
              </th>
              <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium">
                매물번호
              </th>
              <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium">
                공개/거래
              </th>
              <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium">
                거래종류
              </th>
              <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium">
                매물종류
              </th>
              <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium">주소</th>
              <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium">
                매물정보
              </th>
              <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium">금액</th>
              <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium">
                조회수
              </th>
              <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium">
                등록일
              </th>
              <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium">기능</th>
              <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium">비고</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 md:table-row-group">
            {rows.map((listing: IBuild, index: number) => {
              const id = Number(listing.id);
              const confirmDate = (listing as any).confirmDate;
              const createdAtDate = new Date(String(listing.createdAt));
              const updatedAtDate = listing.updatedAt
                ? new Date(String(listing.updatedAt))
                : null;
              const hasUpdate = !!(
                updatedAtDate &&
                updatedAtDate.getTime() - createdAtDate.getTime() > 1000
              );

              return (
                <tr
                  key={id}
                  className={clsx(
                    "block md:table-row hover:bg-slate-300 transition-colors duration-300",
                    index % 2 === 0 ? "bg-slate-100" : "bg-slate-200"
                  )}
                >
                  <td
                    className="p-2 sm:p-3 text-center block md:table-cell"
                    data-label="선택"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(id)}
                      onChange={(e) =>
                        toggleSelect(id, e.currentTarget.checked)
                      }
                      aria-label={`${id} 선택`}
                    />
                  </td>

                  <td
                    className="p-2 sm:p-3 text-xs sm:text-sm block md:table-cell"
                    data-label="매물번호"
                  >
                    {id}
                  </td>

                  <td
                    className="p-2 sm:p-3 text-xs sm:text-sm block md:table-cell"
                    data-label="공개/거래"
                  >
                    <AddressVisibility
                      activeAddressPublic={
                        listing.isAddressPublic as
                          | "public"
                          | "private"
                          | "exclude"
                      }
                      listingId={id}
                      serverSync
                      handleRadioChange={(newState) => {
                        queryClient.setQueryData(
                          qk,
                          (prev: PageData | undefined) => {
                            if (!prev) return prev;
                            return {
                              ...prev,
                              data: prev.data.map((row) =>
                                Number(row.id) === id
                                  ? { ...row, isAddressPublic: newState }
                                  : row
                              ),
                            };
                          }
                        );
                      }}
                    />

                    <div>매물공개여부</div>
                    <ToggleSwitch
                      toggle={!!listing.visibility}
                      id={`visibility-${id}`}
                      onToggle={() => {
                        toggleBuild(listing.id!).catch(() =>
                          alert("매물 공개여부 변경 실패")
                        );
                      }}
                    />
                  </td>

                  <td
                    className="p-2 sm:p-3 text-xs sm:text-sm block md:table-cell"
                    data-label="거래종류"
                  >
                    {listing.buyType as React.ReactNode}
                  </td>
                  <td
                    className="p-2 sm:p-3 text-xs sm:text-sm block md:table-cell"
                    data-label="매물종류"
                  >
                    {listing.propertyType}
                  </td>

                  <td
                    className="p-2 sm:p-3 text-xs sm:text-sm block md:table-cell"
                    data-label="주소"
                  >
                    <div className="max-w-[260px] mx-auto">
                      <span title={listing.address ?? ""}>
                        {listing.address ?? ""}
                      </span>
                    </div>
                  </td>

                  <td
                    className="p-2 sm:p-3 text-xs sm:text-sm block md:table-cell"
                    data-label="매물정보"
                  >
                    <div>{listing.title}</div>
                    {listing.dealScope === '부분' && (
                      <div className="text-red-500 font-semibold">부분소유</div>
                    )}
                    {(listing.roomOption?.name || listing.bathroomOption?.name) && (
                      <div>
                        방 {listing.roomOption?.name} / 화장실{" "}
                        {listing.bathroomOption?.name}
                      </div>
                    )}
                    <AreaInfo listing={listing} />
                    {listing.currentFloor && (
                      <div>
                        {listing.direction} / 지상 {listing.currentFloor}/
                        {listing.totalFloors}층
                      </div>
                    )}
                    {listing.managementEtc && (
                      <div>기타: {listing.managementEtc}</div>
                    )}
                  </td>

                  <td
                    className="p-2 sm:p-3 text-xs sm:text-sm block md:table-cell"
                    data-label="금액"
                  >
                    {listing.isSalePriceEnabled && listing.salePrice && (
                      <div>
                        매: {formatPriceWithDisplay(Number(listing.salePrice), listing.priceDisplay)}
                      </div>
                    )}
                    {listing.isLumpSumPriceEnabled && listing.lumpSumPrice && (
                        <div>
                        전: {formatPriceWithDisplay(Number(listing.lumpSumPrice), listing.priceDisplay)}
                        </div>
                    )}
                    {listing.isActualEntryCostEnabled && listing.actualEntryCost && (
                      <div>
                        실:{" "}
                        {formatPriceWithDisplay(Number(listing.actualEntryCost), listing.priceDisplay)}
                      </div>
                    )}
                    {listing.isDepositEnabled && listing.deposit && (
                        <div>
                        보: {formatPriceWithDisplay(Number(listing.deposit), listing.priceDisplay)}
                        </div>
                    )}
                    {listing.isRentalPriceEnabled && listing.rentalPrice && (
                      <div>
                        월: {formatPriceWithDisplay(Number(listing.rentalPrice), listing.priceDisplay)}
                      </div>
                    )}
                    {listing.isHalfLumpSumMonthlyRentEnabled && listing.halfLumpSumMonthlyRent && (
                        <div>
                        반월: {formatPriceWithDisplay(Number(listing.halfLumpSumMonthlyRent), listing.priceDisplay)}
                        </div>
                    )}
                    {listing.isManagementFeeEnabled && listing.managementFee && (
                      <div>
                        관:{" "}
                        {formatPriceWithDisplay(Number(listing.managementFee), listing.priceDisplay)}
                      </div>
                    )}
                  </td>

                  <td
                    className="p-2 sm:p-3 text-xs sm:text-sm block md:table-cell"
                    data-label="조회수"
                  >
                    {listing?.views ?? 0}
                  </td>

                  <td
                    className="p-2 sm:p-3 text-xs sm:text-sm block md:table-cell"
                    data-label="등록일"
                  >
                    <div>
                      {new Date(String(listing.createdAt)).toLocaleDateString()}
                    </div>

                    {hasUpdate && (
                      <div className="mt-1 text-xs text-rose-600">
                        (수정일: {formatYYYYMMDD(updatedAtDate!)})
                      </div>
                    )}

                    <div className="mt-1 text-xs text-slate-600">
                      현장 확인일: {formatYYYYMMDD(confirmDate)}
                    </div>
                  </td>

                  <td
                    className="p-2 sm:p-3 text-xs sm:text-sm relative block md:table-cell"
                    data-label="기능"
                  >
                    <div className="flex flex-col gap-y-2 justify-center items-center">
                      {/* 프린트 드롭다운 트리거 */}
                      <button
                        type="button"
                        className="text-xs sm:text-sm text-white bg-blue-500 px-2 sm:px-3 py-1 rounded-lg shadow hover:bg-blue-400 transition duration-200 w-full"
                        onClick={() =>
                          setPrintMenuRowId((p) => (p === id ? null : id))
                        }
                      >
                        프린트
                      </button>

                      {/* 프린트 드롭다운 */}
                      {printMenuRowId === id && (
                        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-10 w-56 bg-white border border-slate-200 rounded-lg shadow-lg text-sm">
                          <button
                            type="button"
                            onClick={() => {
                              setPrintMenuRowId(null);
                              printPhotoVersion(listing, workInfoData?.data, { showPhotos: true });
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-slate-100"
                          >
                            사진 버전 (대표 + 최대 3장)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPrintMenuRowId(null);
                              printPhotoVersion(listing, workInfoData?.data, { showPhotos: false });
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-slate-100"
                          >
                            텍스트 버전 (사진 없음)
                          </button>
                        </div>
                      )}

                      {/* 확인일 */}
                      {!confirmDate ? (
                        <button
                          onClick={() => addConfirmDate(id)}
                          className="text-xs sm:text-sm text-white bg-blue-500 px-2 sm:px-3 py-1 rounded-lg shadow hover:bg-blue-400 transition duration-200 w-full"
                        >
                          확인일 추가
                        </button>
                      ) : (
                        <div className="relative">
                          <button
                            onClick={() =>
                              setMenuRowId((prev) => (prev === id ? null : id))
                            }
                            className="text-xs sm:text-sm text-white bg-blue-500 px-2 sm:px-3 py-1 rounded-lg shadow hover:bg-blue-400 transition duration-200 w-full"
                          >
                            확인일 갱신
                          </button>

                          {menuRowId === id && (
                            <div className="absolute top-10 left-1/2 -translate-x-1/2 z-10 w-36 bg-white border border-slate-200 rounded-lg shadow-lg text-sm">
                              <button
                                onClick={() => updateConfirmDateToToday(id)}
                                className="w-full text-left px-3 py-2 hover:bg-slate-100"
                              >
                                확인일 갱신(오늘)
                              </button>
                              <button
                                onClick={() => editConfirmDate(id)}
                                className="w-full text-left px-3 py-2 hover:bg-slate-100"
                              >
                                확인일 수정
                              </button>
                              <button
                                onClick={() => deleteConfirmDate(id)}
                                className="w-full text-left px-3 py-2 hover:bg-slate-100 text-red-600"
                              >
                                확인일 삭제
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  <td
                    className="p-2 sm:p-3 text-xs sm:text-sm block md:table-cell"
                    data-label="비고"
                  >
                    <div className="flex flex-col gap-y-2 justify-center items-center">
                      <Link
                        href={`/admin/listings/listings/${id}/edit`}
                        className="text-xs sm:text-sm text-white bg-green-500 px-2 sm:px-3 py-1 rounded-lg shadow hover:bg-green-400 transition duration-200 w-full text-center"
                      >
                        수정
                      </Link>
                      <button
                        onClick={() => handleDelete(id)}
                        disabled={isDeleting}
                        className={clsx(
                          "text-xs sm:text-sm text-white px-2 sm:px-3 py-1 rounded-lg shadow transition duration-200 w-full",
                          isDeleting
                            ? "bg-red-300 cursor-not-allowed"
                            : "bg-red-500 hover:bg-red-400"
                        )}
                      >
                        삭제
                      </button>
                    </div>

                    {/* ▼ 비밀 메모 : 버튼처럼 보이지만 클릭 불가, hover 시 내용 노출 */}
                    <div className="mt-3 relative group flex justify-center">
                      <div
                        aria-hidden
                        className="inline-block select-none px-3 py-1 rounded-md border border-slate-400 bg-white text-slate-700 text-xs font-medium shadow-sm"
                      >
                        비밀 메모
                      </div>

                      <div
                        className="
                          absolute left-1/2 top-full mt-2 -translate-x-1/2 z-20
                          w-64 rounded-md border border-slate-200 bg-white p-3 text-left text-xs text-slate-700 shadow-xl
                          opacity-0 invisible group-hover:opacity-100 group-hover:visible
                        "
                        role="tooltip"
                      >
                        <div className="font-semibold mb-1">비밀 메모</div>
                        <div className="whitespace-pre-line break-words">
                          {listing.secretNote ?? "—"}
                        </div>

                        <div className="font-semibold mt-2 mb-1">
                          고객 연락처
                        </div>
                        <div className="break-words">
                          {listing.secretContact ?? "—"}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="my-4 flex justify-center">
          <Pagination
            totalPages={data?.totalPages ?? 1}
            currentPage={data?.currentPage ?? page}
            onPageChange={setPage}
          />
        </div>
      </div>
    </FormProvider>
  );
};

export default ListingsMain;
