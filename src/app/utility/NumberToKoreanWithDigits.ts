export function numberToKoreanWithDigits(num: number): string {
  if (num === 0) return "0원";

  const units = ["", "만", "억", "조", "경"];
  const numChars = ["", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  const formatPart = (n: number) => {
    if (n === 0) return "";
    const t = Math.floor(n / 1000) % 10;
    const h = Math.floor(n / 100) % 10;
    const e = Math.floor(n / 10) % 10;
    const o = n % 10;

    let str = "";
    if (t > 0) str += numChars[t] + "천";
    if (h > 0) str += numChars[h] + "백";
    if (e > 0) str += numChars[e] + "십";
    if (o > 0) str += numChars[o];
    return str;
  };

  const result = [];
  let unitIndex = 0;

  while (num > 0) {
    const part = num % 10000;
    if (part > 0) {
      result.unshift(formatPart(part) + units[unitIndex]);
    }
    num = Math.floor(num / 10000);
    unitIndex++;
  }

  return result.join("") + "원";
}