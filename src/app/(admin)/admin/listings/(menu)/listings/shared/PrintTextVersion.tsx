import { IBuild } from "@/app/interface/build";
import formatFullKoreanMoney from "@/app/utility/NumberToKoreanMoney";
import { formatYYYYMMDD } from "@/app/utility/koreaDateControl";
import { openPrintSafe } from "@/app/utility/print";

export const printTextVersion = (listing: IBuild) => {
  const adminHas =
    Array.isArray(listing.adminImage) && listing.adminImage.length > 0;
  const body = `
      <div class="card">
        <div class="h1">매물 #${listing.id} — ${listing.title ?? ""}</div>
        <div class="muted">${listing.address ?? ""}</div>
      </div>

      <div class="card">
        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <tbody>
            <tr>
              <td style="width:18%; padding:6px; background:#f5f6f8;">거래유형</td>
              <td style="width:32%; padding:6px;">${listing.buyType ?? "-"}</td>
              <td style="width:18%; padding:6px; background:#f5f6f8;">매물종류</td>
              <td style="width:32%; padding:6px;">${listing.propertyType ?? "-"}</td>
            </tr>
            <tr>
              <td style="padding:6px; background:#f5f6f8;">라벨</td>
              <td style="padding:6px;">${listing.label ?? "-"}</td>
              <td style="padding:6px; background:#f5f6f8;">인기/급매</td>
              <td style="padding:6px;">${listing.popularity ?? "-"}</td>
            </tr>
            <tr>
              <td style="padding:6px; background:#f5f6f8;">금액 표기</td>
              <td style="padding:6px;">${listing.priceDisplay ?? "-"}</td>
              <td style="padding:6px; background:#f5f6f8;">방향</td>
              <td style="padding:6px;">${listing.direction ?? "-"}</td>
            </tr>
            <tr>
              <td style="padding:6px; background:#f5f6f8;">분양가</td>
              <td style="padding:6px;">${listing.salePrice != null ? formatFullKoreanMoney(Number(listing.salePrice)) : "-"}</td>
              <td style="padding:6px; background:#f5f6f8;">전세가</td>
              <td style="padding:6px;">${listing.rentalPrice != null ? formatFullKoreanMoney(Number(listing.rentalPrice)) : "-"}</td>
            </tr>
            <tr>
              <td style="padding:6px; background:#f5f6f8;">실입주금</td>
              <td style="padding:6px;">${listing.actualEntryCost != null
                  ? formatFullKoreanMoney(Number(listing.actualEntryCost))
                  : "-"}</td>
              <td style="padding:6px; background:#f5f6f8;">관리비</td>
              <td style="padding:6px;">${listing.managementFee != null
                  ? formatFullKoreanMoney(Number(listing.managementFee))
                  : "-"}</td>
            </tr>
            <tr>
              <td style="padding:6px; background:#f5f6f8;">건물 층수</td>
              <td style="padding:6px;">지상 ${listing.totalFloors ?? "-"}층 / 지하 ${listing.basementFloors ?? "-"}층</td>
              <td style="padding:6px; background:#f5f6f8;">해당 층수</td>
              <td style="padding:6px;">${listing.floorType ?? ""} ${listing.currentFloor
      ? listing.currentFloor < 0
        ? `B${Math.abs(listing.currentFloor)}`
        : listing.currentFloor
      : "-"}층</td>
            </tr>
            <tr>
              <td style="padding:6px; background:#f5f6f8;">방/욕실</td>
              <td style="padding:6px;">${listing.roomOption?.name ?? "-"} / ${listing.bathroomOption?.name ?? "-"}</td>
              <td style="padding:6px; background:#f5f6f8;">실면적(평)</td>
              <td style="padding:6px;">${listing.actualArea ?? "-"}</td>
            </tr>
            <tr>
              <td style="padding:6px; background:#f5f6f8;">공급면적(평)</td>
              <td style="padding:6px;">${listing.supplyArea ?? "-"}</td>
              <td style="padding:6px; background:#f5f6f8;">연면적(㎡)</td>
              <td style="padding:6px;">${listing.totalArea ?? "-"}</td>
            </tr>
            <tr>
              <td style="padding:6px; background:#f5f6f8;">난방</td>
              <td style="padding:6px;">${listing.heatingType ?? "-"}</td>
              <td style="padding:6px; background:#f5f6f8;">입주</td>
              <td style="padding:6px;">${listing.moveInType ?? "-"}</td>
            </tr>
            <tr>
              <td style="padding:6px; background:#f5f6f8;">엘리베이터</td>
              <td style="padding:6px;">${listing.elevatorType ?? "-"} ${listing.elevatorCount ? `(${listing.elevatorCount}대)` : ""}</td>
              <td style="padding:6px; background:#f5f6f8;">주차</td>
              <td style="padding:6px;">${Array.isArray(listing.parking) ? listing.parking.join(", ") : listing.parking ?? "-"}</td>
            </tr>
            <tr>
              <td style="padding:6px; background:#f5f6f8;">주차(세대/전체)</td>
              <td style="padding:6px;">${listing.parkingPerUnit ?? "-"} / ${listing.totalParking ?? "-"}</td>
              <td style="padding:6px; background:#f5f6f8;">옵션</td>
              <td style="padding:6px;">${Array.isArray(listing.buildingOptions) ? listing.buildingOptions.join(", ") : "-"}</td>
            </tr>
            <tr>
              <td style="padding:6px; background:#f5f6f8;">테마</td>
              <td style="padding:6px;">${Array.isArray(listing.themes) ? listing.themes.join(", ") : "-"}</td>
              <td style="padding:6px; background:#f5f6f8;">허가/승인/착공</td>
              <td colspan="3" style="padding:6px;">
                허가 ${listing.permitDate ? formatYYYYMMDD(new Date(String(listing.permitDate))) : "-"} · 
                승인 ${listing.approvalDate
      ? formatYYYYMMDD(new Date(String(listing.approvalDate)))
      : "-"} · 
                착공 ${listing.constructionYear
      ? formatYYYYMMDD(new Date(String(listing.constructionYear)))
      : "-"}
              </td>
            </tr>
            <tr>
              <td style="padding:6px; background:#f5f6f8;">관리자용 사진</td>
              <td colspan="3" style="padding:6px;">${adminHas ? "있음" : "없음"}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  openPrintSafe({ title: `매물 #${listing.id}`, bodyHtml: body });
};