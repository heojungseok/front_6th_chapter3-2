import { RepeatType } from '../types';

export interface RecurrenceInstance {
  date: Date;
  isOriginal: boolean;
}

export interface RecurrenceRule {
  endDate?: Date;
  interval: number;
  maxOccurrences?: number;
  startDate: Date;
  type: RepeatType;
}

/**
 * 반복 일정의 다음 발생 날짜를 계산합니다.
 */
export function getNextRecurrenceDate(
  currentDate: Date,
  rule: RecurrenceRule,
  occurrenceCount: number = 0
): Date | null {
  if (rule.type === 'none') return null;

  const nextDate = new Date(currentDate);

  switch (rule.type) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + rule.interval * occurrenceCount);
      break;

    case 'weekly':
      nextDate.setDate(nextDate.getDate() + rule.interval * 7 * occurrenceCount);
      break;

    case 'monthly': {
      // 31일에 매월 반복인 경우, 31일에만 생성
      const originalDay = currentDate.getDate();
      const targetMonth = currentDate.getMonth() + rule.interval * occurrenceCount;
      nextDate.setMonth(targetMonth);

      // 월말 처리: 31일이 없는 월의 경우 31일에 생성하지 않음
      const daysInMonth = new Date(nextDate.getFullYear(), targetMonth + 1, 0).getDate();
      if (originalDay > daysInMonth) {
        return null; // 해당 월에는 발생하지 않음
      }
      break;
    }

    case 'yearly': {
      // 2월 29일에 매년 반복인 경우, 윤년에만 29일에 생성
      const originalMonth = currentDate.getMonth();
      const originalDayOfMonth = currentDate.getDate();
      // 아래 코드(2월 29일 처리 등)는 기존처럼 이 블록 안에 위치해야 함
      nextDate.setFullYear(nextDate.getFullYear() + rule.interval * occurrenceCount);

      // 2월 29일 처리: 윤년이 아닌 경우 29일에 생성하지 않음
      if (originalMonth === 1 && originalDayOfMonth === 29) {
        const isLeapYear = (year: number) =>
          (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

        if (!isLeapYear(nextDate.getFullYear())) {
          return null; // 윤년이 아닌 경우 발생하지 않음
        }
      }
      break;
    }
  }

  // 종료 날짜 체크
  if (rule.endDate && nextDate > rule.endDate) {
    return null;
  }

  // 최대 발생 횟수 체크
  if (rule.maxOccurrences && occurrenceCount >= rule.maxOccurrences) {
    return null;
  }

  return nextDate;
}

/**
 * 반복 일정의 모든 발생 날짜를 계산합니다.
 */
export function getAllRecurrenceDates(rule: RecurrenceRule): Date[] {
  if (rule.type === 'none') return [rule.startDate];

  const dates: Date[] = [rule.startDate];
  let occurrenceCount = 1;

  while (true) {
    const nextDate = getNextRecurrenceDate(rule.startDate, rule, occurrenceCount);
    if (!nextDate) break;

    dates.push(nextDate);
    occurrenceCount++;

    // 무한 루프 방지
    if (occurrenceCount > 1000) break;
  }

  return dates;
}

/**
 * 특정 날짜가 반복 일정의 발생 날짜인지 확인합니다.
 */
export function isRecurrenceDate(date: Date, rule: RecurrenceRule): boolean {
  if (rule.type === 'none') {
    return date.getTime() === rule.startDate.getTime();
  }

  const allDates = getAllRecurrenceDates(rule);
  return allDates.some((d) => d.getTime() === date.getTime());
}

/**
 * 반복 일정의 다음 발생 날짜를 찾습니다.
 */
export function findNextRecurrenceDate(afterDate: Date, rule: RecurrenceRule): Date | null {
  if (rule.type === 'none') return null;

  let occurrenceCount = 0;
  let nextDate: Date | null = null;

  while (occurrenceCount < 1000) {
    // 무한 루프 방지
    nextDate = getNextRecurrenceDate(rule.startDate, rule, occurrenceCount);
    if (!nextDate) break;

    if (nextDate > afterDate) {
      return nextDate;
    }

    occurrenceCount++;
  }

  return null;
}
