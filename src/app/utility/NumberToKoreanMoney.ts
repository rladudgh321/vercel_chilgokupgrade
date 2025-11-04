function formatFullKoreanMoney(num: number): string {
  if (num === 0) return "0원";

  const largeUnits = [
    { value: 100000000, label: "억" },
    { value: 10000, label: "만" },
  ];
  const smallUnits = [
    { value: 1000, label: "천" },
    { value: 100, label: "백" },
    { value: 10, label: "십" },
    { value: 1, label: "" },
  ];

  let result = "";

  // 처리: 억, 만 단위
  for (const { value, label } of largeUnits) {
    let unitVal = Math.floor(num / value);
    if (unitVal > 0) {
      let part = "";

      for (const { value: smallVal, label: smallLabel } of smallUnits) {
        const digit = Math.floor(unitVal / smallVal);
        if (digit > 0) {
          part += `${digit}${smallLabel}`;
          unitVal %= smallVal;
        }
      }

      result += `${part}${label}`;
      num %= value;
    }
  }

  // 처리: 만 단위 미만 (천 이하)
  let belowManPart = "";
  for (const { value, label } of smallUnits) {
    const digit = Math.floor(num / value);
    if (digit > 0) {
      belowManPart += `${digit}${label}`;
      num %= value;
    }
  }

  if (belowManPart) {
    result += `${belowManPart}원`;
  } else if (!result.endsWith("만") && result !== "") {
    // 만 이하가 없으면 '만'으로 끝나게
    result += "만";
  }

  return result;
}

export default formatFullKoreanMoney;