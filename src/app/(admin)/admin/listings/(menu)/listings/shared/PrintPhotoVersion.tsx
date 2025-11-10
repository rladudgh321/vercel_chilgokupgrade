import { IBuild } from "@/app/interface/build";
import formatFullKoreanMoney from "@/app/utility/NumberToKoreanMoney";
import { numberToKoreanWithDigits } from '@/app/utility/NumberToKoreanWithDigits';
import { formatYYYYMMDD } from "@/app/utility/koreaDateControl";
import { openPrintSafe } from "@/app/utility/print";

export const printPhotoVersion = async (listing: IBuild, workInfo, options?: { showPhotos: boolean }) => {
  const showPhotos = options?.showPhotos ?? true;

  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null) return "";
    return numberToKoreanWithDigits(price);
  };

  const formatPriceWithDisplay = (
    price: number | undefined | null,
    priceDisplay: string | undefined | null,
    formatter: (p: number) => string
  ) => {
    if (price === undefined || price === null) return "";
    let formattedPrice = formatter(price);
    if (priceDisplay === "비공개") {
      formattedPrice = `${formattedPrice} (비공개)`;
    } else if (priceDisplay === "협의가능") {
      formattedPrice = `${formattedPrice} (협의가능)`;
    }
    return formattedPrice;
  };

  const mainImages = [listing.mainImage, ...(Array.isArray(listing.subImage) ? listing.subImage : [])]
    .filter(src => !!src)
    .slice(0, 4);

  const cleanedAddress = listing.address ? String(listing.address).replace(/\(.*?\)/g, '').trim() : "";

  function escapeHtml(str: string) {
    if (typeof str !== 'string') {
        return '';
    }
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const generateTableRows = (items: { label: string, value: any, unit?: string }[]) => {
    let html = '';
    const filteredItems = items.filter(item => item.value !== null && item.value !== undefined && item.value !== "");

    for (let i = 0; i < filteredItems.length; i += 2) {
      const item1 = filteredItems[i];
      const item2 = i + 1 < filteredItems.length ? filteredItems[i + 1] : null;

      html += '<tr>';
      html += `<td class="label">${escapeHtml(item1.label)}</td>`;
      html += `<td class="value">${escapeHtml(String(item1.value))}${item1.unit || ''}</td>`;

      if (item2) {
        html += `<td class="label">${escapeHtml(item2.label)}</td>`;
        html += `<td class="value">${escapeHtml(String(item2.value))}${item2.unit || ''}</td>`;
      } else {
        html += '<td class="label"></td><td class="value"></td>';
      }
      html += '</tr>';
    }
    return html;
  };

  const coreInfoItems = [
    { label: "제목", value: listing.title },
    listing.dealScope === '부분' ? { label: "소유권", value: "부분 소유" } : null,
    { label: "거래 종류", value: listing.buyType },
    { label: "매물 종류", value: listing.propertyType },
    listing.isSalePriceEnabled ? { label: "매매가", value: formatPriceWithDisplay(listing.salePrice, listing.priceDisplay, formatFullKoreanMoney) } : null,
    listing.isLumpSumPriceEnabled ? { label: "전세가", value: formatPriceWithDisplay(listing.lumpSumPrice, listing.priceDisplay, formatFullKoreanMoney) } : null,
    listing.isActualEntryCostEnabled ? { label: "실입주금", value: formatPriceWithDisplay(listing.actualEntryCost, listing.priceDisplay, formatFullKoreanMoney) } : null,
    listing.isDepositEnabled ? { label: "보증금", value: formatPriceWithDisplay(listing.deposit, listing.priceDisplay, formatFullKoreanMoney) } : null,
    listing.isRentalPriceEnabled ? { label: "월세", value: formatPriceWithDisplay(listing.rentalPrice, listing.priceDisplay, formatFullKoreanMoney) } : null,
    listing.isManagementFeeEnabled ? { label: "관리비", value: formatPriceWithDisplay(listing.managementFee, listing.priceDisplay, formatFullKoreanMoney) } : null,
    { label: "건물 층수", value: (listing.totalFloors || listing.basementFloors) ? `지상 ${listing.totalFloors || '-'}층 / 지하 ${listing.basementFloors || '-'}층` : null },
    { label: "해당 층수", value: listing.currentFloor !== undefined && listing.currentFloor !== null ? `${listing.floorType || ''} ${listing.currentFloor < 0 ? `B${Math.abs(listing.currentFloor)}` : listing.currentFloor}층` : null },
    { label: "방/화장실 수", value: (listing.roomOption?.name || listing.bathroomOption?.name) ? `${listing.roomOption?.name || "-"} / ${listing.bathroomOption?.name || "-"}`: null },
    listing.totalArea ? { label: "연면적", value: listing.totalArea, unit: "m²" } : { label: "실면적", value: listing.actualArea, unit: "m²" },
    !listing.totalArea ? { label: "공급면적", value: listing.supplyArea, unit: "m²" } : null,
  ].filter(Boolean) as { label: string, value: any, unit?: string }[];

  const buildingInfoItems = [
    (listing.totalParking || listing.parkingPerUnit || listing.parkingFee) ? { label: "주차 옵션", value: `총 ${listing.totalParking || "-"}대 (세대당 ${listing.parkingPerUnit || "-"}대), 주차비: ${formatPriceWithDisplay(listing.parkingFee, listing.priceDisplay, numberToKoreanWithDigits)}` } : null,
    { label: "엘리베이터", value: listing.elevatorType === "유" ? `${listing.elevatorCount || "-"}개` : listing.elevatorType },
    { label: "난방 방식", value: listing.heatingType },
    { label: "수익률 사용", value: listing.yieldType && listing.yieldType !== "미사용" ? (listing.yieldType === "기타수익률" ? listing.otherYield : listing.yieldType) : null },
    { label: "입주 가능일", value: listing.moveInType === "즉시" ? "입주 즉시 가능" : (listing.moveInDate ? `${formatYYYYMMDD(new Date(String(listing.moveInDate)))} (${listing.moveInType})` : listing.moveInType) },
    { label: "계약만료일", value: listing.contractEndDate ? formatYYYYMMDD(new Date(String(listing.contractEndDate))) : null },
    { label: "건물명", value: listing.buildingName },
    { label: "용적률 산정면적", value: listing.floorAreaRatio },
    { label: "기타용도", value: listing.otherUse },
    { label: "주구조", value: listing.mainStructure },
    { label: "높이", value: listing.height },
    { label: "지붕구조", value: listing.roofStructure },
    { label: "건축년도", value: listing.constructionYear ? formatYYYYMMDD(new Date(String(listing.constructionYear))) : null },
    { label: "허가일자", value: listing.permitDate ? formatYYYYMMDD(new Date(String(listing.permitDate))) : null },
    { label: "사용승인일자", value: listing.approvalDate ? formatYYYYMMDD(new Date(String(listing.approvalDate))) : null },
    { label: "방향", value: listing.direction ? `${listing.direction} (기준: ${listing.directionBase})` : null },
    { label: "용도지역", value: listing.landUse },
    { label: "지목", value: listing.landType },
    { label: "건축물용도", value: listing.buildingUse },
    { label: "테마", value: listing.themes },
    { label: "옵션", value: Array.isArray(listing.buildingOptions) ? listing.buildingOptions.map(o => o.name).join(', ') : null },
  ].filter(Boolean) as { label: string, value: any, unit?: string }[];

  const bodyHtml = `
    <html>
    <head>
      <meta charset="utf-8" />
      <title>매물 정보 #${escapeHtml(String(listing.id))}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');
        body { 
          font-family: 'Noto Sans KR', sans-serif; 
          background:#fff; 
          color:#333; 
          margin:0; 
          padding:0;
        }
        .container { 
          width:100%; 
          max-width:100%; 
          padding: 0; 
          box-sizing:border-box; 
        }
        .header { border-bottom:2px solid #4a5568; padding-bottom:12px; margin-bottom:20px; page-break-after:avoid; }
        .title { font-size:24px; font-weight:700; color:#2d3748; }
        .address-line { 
          display: flex;
          justify-content: space-between;
          font-size:14px; 
          color:#718096; 
          margin-top:4px; 
        }
        .section { margin-bottom:24px; page-break-inside:avoid; }
        .section-title { font-size:18px; font-weight:700; color:#4a5568; border-bottom:1px solid #cbd5e0; padding-bottom:8px; margin-bottom:12px; }
        .photo-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }
        .photo-grid img { width:100%; height:220px; object-fit:cover; border-radius:8px; border:1px solid #e2e8f0; }
        .info-table { width:100%; border-collapse:collapse; font-size:13px; }
        .info-table tr { border-bottom:1px solid #e2e8f0; }
        .info-table td { padding:8px; vertical-align:top; }
        .info-table .label { font-weight:500; background:#f7fafc; width:15%; color:#4a5568; }
        .info-table .value { width:35%; }
        .map-placeholder { flex:1; height:300px; background:#f7fafc; border:1px solid #e2e8f0; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#a0aec0; }
        .building-info { background:#f7fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px; }
        .prose { max-width: none; line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
        
        @media print {
          @page {
            size: A4;
            margin: 20mm;
            /* Clear default browser headers/footers */
            @top-left { content: none; }
            @top-center { content: none; }
            @top-right { content: none; }
            @bottom-left { content: none; }
            @bottom-center { content: none; }
            @bottom-right { content: none; }
          }

          body {
            -webkit-print-color-adjust:exact; 
            color-adjust:exact;
            counter-reset: page;
          }

          .container { box-shadow:none; border:none; }
          .header { display: block; } /* Show the original header in print */
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="title">${escapeHtml(workInfo.companyName)}</div>
          <div class="address-line">
            <span>${escapeHtml(cleanedAddress || '주소 정보 없음')}</span>
            ${workInfo ? `<span>${escapeHtml(workInfo.owner)} | ${escapeHtml(workInfo.phone)} | ${escapeHtml(workInfo.mobile)}</span>` : ''}
          </div>
        </div>

        ${showPhotos ? `
        <div class="section">
          <h2 class="section-title">매물 사진</h2>
          <div class="photo-grid">
            ${mainImages.length > 0 ? mainImages.map(src => `<img src="${escapeHtml(src)}" alt="매물 사진">`).join('') : '<div class="map-placeholder">사진 없음</div>'}
          </div>
        </div>
        ` : ''}

        <div class="section">
          <h2 class="section-title">핵심 정보</h2>
          <table class="info-table">
            <tbody>
              ${generateTableRows(coreInfoItems)}
            </tbody>
          </table>
        </div>

        ${listing.editorContent ? `
        <div class="section">
          <h2 class="section-title">상세 설명</h2>
          <div class="prose">
            ${listing.editorContent}
          </div>
        </div>
        ` : ''}

        <div class="section building-info">
          <h2 class="section-title">건물 추가 정보</h2>
          <table class="info-table">
            <tbody>
              ${generateTableRows(buildingInfoItems)}
            </tbody>
          </table>
        </div>
      </div>
    </body>
    </html>
  `;

  openPrintSafe({ title: `매물 #${listing.id}`, bodyHtml });
};
