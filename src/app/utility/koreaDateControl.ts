export function formatYYYYMMDD(d: Date | string | null | undefined): string {
  // null, undefined, 빈 문자열 체크
  if (!d) return "—";
  
  // YYYY-MM-DD 형식의 문자열인 경우 직접 포맷팅
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
    const [year, month, day] = d.split('-');
    return `${year}.${month}.${day}.`;
  }
  
  // Date 객체로 변환
  let date: Date;
  if (d instanceof Date) {
    date = d;
  } else if (typeof d === 'string') {
    date = new Date(d);
  } else {
    return "—";
  }
  
  // 유효한 날짜인지 확인
  if (isNaN(date.getTime())) {
    return "—";
  }

  try {
    const parts = new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);

    const y = parts.find(p => p.type === "year")?.value;
    const m = parts.find(p => p.type === "month")?.value;
    const day = parts.find(p => p.type === "day")?.value;
    
    if (!y || !m || !day) {
      return "—";
    }
    
    return `${y}.${m}.${day}.`;
  } catch {
    return "—";
  }
}