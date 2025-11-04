// enums (스키마와 동일)
export type AddressPublic = 'public' | 'private' | 'exclude';

// 최소 참조 타입들 (관계 객체 UI에서 name, id 정도만 쓸 수 있도록)
export interface LabelRef {
  id: number;
  name: string;
}
export interface ListingTypeRef {
  id: number;
  name: string;
  imageUrl?: string | null;
  imageName?: string | null;
  order?: number | null;
}
export interface BuyTypeRef {
  id: number;
  name: string;
  order?: number | null;
}
export interface OptionRef {
  id: number;
  name: string;
  imageUrl?: string | undefined;
  imageName?: string | undefined;
}

// Json 필드에 대한 유틸 타입
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

// ─────────────────────────────────────────────────────────────
// Build 스키마에 맞춘 IBuild
// ─────────────────────────────────────────────────────────────
export interface IBuild {
  id?: number;

  // 주소/위치
  address?: string | null;
  dong?: string | null;
  ho?: string | null;
  etc?: string | null;
  isAddressPublic?: AddressPublic | null; // default(public)

  // 분류/노출
  propertyType?: string | null;
  listingTypeId?: number | null;
  listingType?: ListingTypeRef | null;
  buyTypeId?: number | null;
  buyType?: string;
  dealScope?: string | null;
  visibility?: boolean | null;     // default(true)
  priceDisplay?: string | null;

  // 가격 및 노출 플래그
  salePrice?: number | null;
  isSalePriceEnabled?: boolean | null;                 // default(false)
  lumpSumPrice?: number | null;
  isLumpSumPriceEnabled?: boolean | null;              // default(false)
  actualEntryCost?: number | null;
  isActualEntryCostEnabled?: boolean | null;           // default(false)
  rentalPrice?: number | null;
  isRentalPriceEnabled?: boolean | null;               // default(false)
  halfLumpSumMonthlyRent?: number | null;
  isHalfLumpSumMonthlyRentEnabled?: boolean | null;    // default(false)
  deposit?: number | null;
  isDepositEnabled?: boolean | null;                   // default(false)
  managementFee?: number | null;
  isManagementFeeEnabled?: boolean | null;             // default(false)
  managementEtc?: string | null;

  // 라벨/인기
  labelId?: number | null;
  label?: LabelRef | null;
  popularity?: string | null; // 스키마는 String? — 기존 string[] 사용 시 마이그레이션 필요

  // 층/면적/옵션
  floorType?: string | null;
  currentFloor?: number | null;
  totalFloors?: number | null;
  basementFloors?: number | null;
  floorDescription?: string | null;

  // 관계 옵션들
  floorOptionId?: number | null;
  floorOption?: OptionRef | null;
  roomOptionId?: number | null;
  roomOption?: OptionRef | null;
  bathroomOptionId?: number | null;
  bathroomOption?: OptionRef | null;
  buildingOptions?: OptionRef[];           // relation many
  themes?: string[];                       // default([])

  // 면적
  actualArea?: number | null;
  supplyArea?: number | null;
  landArea?: number | null;
  buildingArea?: number | null;
  totalArea?: number | null;

  // 날짜
  constructionYear?: string | Date | null;
  permitDate?: string | Date | null;
  approvalDate?: string | Date | null;

  // 주차
  parkingPerUnit?: number | null;
  totalParking?: number | null;
  parkingFee?: number | null;
  parking?: string[];                      // default([])

  // 방향 등
  direction?: string | null;
  directionBase?: string | null;

  // 용도/토지/건축
  landUse?: string | null;
  landType?: string | null;
  buildingUse?: string | null;
  staff?: string | null;
  customerType?: string | null;
  customerName?: string | null;

  // 기타 스펙
  elevatorType?: string | null;
  elevatorCount?: number | null;
  moveInType?: string | null;
  moveInDate?: string | Date | null;
  heatingType?: string | null;
  yieldType?: string | null;
  otherYield?: string | null;
  contractEndDate?: string | Date | null;
  buildingName?: string | null;
  floorAreaRatio?: string | null;
  otherUse?: string | null;
  mainStructure?: string | null;
  height?: string | null;
  roofStructure?: string | null;

  // 콘텐츠
  title?: string | null;
  editorContent?: string | null;
  secretNote?: string | null;
  secretContact?: string | null;

  // 이미지 (DB는 Json? → 런타임에서는 배열 사용 권장)
  mainImage?: string | null;
  subImage?: string[] | JsonValue | null;   // DB Json을 그대로 두거나, 사용처에서 string[]로 정규화
  adminImage?: string[] | JsonValue | null; // DB Json

  // 시스템
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  deletedAt?: string | Date | null;
  views?: number | null;                    // default(0)
  confirmDate?: string | Date | null;
}
