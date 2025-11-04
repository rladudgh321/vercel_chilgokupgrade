import { extractNumber } from 'kor-to-number';

export function koreanToNumber(korean: string): number | null {
  const result = extractNumber(korean.replace("원", ""));
  if (result.length > 0) {
    return result[0];
  }
  return null;
}
