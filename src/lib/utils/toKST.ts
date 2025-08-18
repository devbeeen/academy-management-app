// utils/date.ts
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc); // UTC 플러그인
dayjs.extend(timezone); // 타임존 변환 플러그인 ('Asia/Seoul'와 같은 타임존으로 변환)

export function toKST(
  utcString: string,
  format: string = 'YYYY-MM-DD HH:mm:ss',
): string {
  if (!utcString) return '';
  return dayjs.utc(utcString).tz('Asia/Seoul').format(format);
}
