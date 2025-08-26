import { describe, it, expect } from 'vitest';

import {
  getNextRecurrenceDate,
  getAllRecurrenceDates,
  isRecurrenceDate,
  findNextRecurrenceDate,
  RecurrenceRule,
} from '../../utils/recurrenceUtils';

describe('반복 일정 유틸리티', () => {
  describe('getNextRecurrenceDate', () => {
    it('반복되지 않는 이벤트의 경우 null을 반환해야 한다', () => {
      const rule: RecurrenceRule = {
        type: 'none',
        interval: 1,
        startDate: new Date('2024-01-15'),
      };

      const result = getNextRecurrenceDate(new Date('2024-01-15'), rule, 1);
      expect(result).toBeNull();
    });

    describe('매일 반복', () => {
      it('다음 매일 반복 날짜를 올바르게 계산해야 한다', () => {
        const rule: RecurrenceRule = {
          type: 'daily',
          interval: 1,
          startDate: new Date('2024-01-15'),
        };

        const result = getNextRecurrenceDate(new Date('2024-01-15'), rule, 1);
        expect(result).toEqual(new Date('2024-01-16'));
      });

      it('사용자 정의 매일 간격을 처리해야 한다', () => {
        const rule: RecurrenceRule = {
          type: 'daily',
          interval: 2,
          startDate: new Date('2024-01-15'),
        };

        const result = getNextRecurrenceDate(new Date('2024-01-15'), rule, 1);
        expect(result).toEqual(new Date('2024-01-17'));
      });
    });

    describe('매주 반복', () => {
      it('다음 매주 반복 날짜를 올바르게 계산해야 한다', () => {
        const rule: RecurrenceRule = {
          type: 'weekly',
          interval: 1,
          startDate: new Date('2024-01-15'), // 월요일
        };

        const result = getNextRecurrenceDate(new Date('2024-01-15'), rule, 1);
        expect(result).toEqual(new Date('2024-01-22'));
      });

      it('사용자 정의 매주 간격을 처리해야 한다', () => {
        const rule: RecurrenceRule = {
          type: 'weekly',
          interval: 2,
          startDate: new Date('2024-01-15'),
        };

        const result = getNextRecurrenceDate(new Date('2024-01-15'), rule, 1);
        expect(result).toEqual(new Date('2024-01-29'));
      });
    });

    describe('매월 반복', () => {
      it('다음 매월 반복 날짜를 올바르게 계산해야 한다', () => {
        const rule: RecurrenceRule = {
          type: 'monthly',
          interval: 1,
          startDate: new Date('2024-01-15'),
        };

        const result = getNextRecurrenceDate(new Date('2024-01-15'), rule, 1);
        expect(result).toEqual(new Date('2024-02-15'));
      });

      it('31일을 올바르게 처리해야 한다 - 31일에만 생성', () => {
        const rule: RecurrenceRule = {
          type: 'monthly',
          interval: 1,
          startDate: new Date('2024-01-31'),
        };

        // 2월 (28일) - null을 반환해야 함
        const febResult = getNextRecurrenceDate(new Date('2024-01-31'), rule, 2);
        expect(febResult).toBeNull();

        // 3월 (31일) - 3월 31일을 반환해야 함
        const marchResult = getNextRecurrenceDate(new Date('2024-01-31'), rule, 2);
        expect(marchResult).toEqual(new Date('2024-03-31'));
      });

      it('다른 일수를 가진 월들을 처리해야 한다', () => {
        const rule: RecurrenceRule = {
          type: 'monthly',
          interval: 1,
          startDate: new Date('2024-01-30'),
        };

        // 2월 (28일) - null을 반환해야 함
        const febResult = getNextRecurrenceDate(new Date('2024-01-30'), rule, 1);
        expect(febResult).toBeNull();

        // 3월 (31일) - 3월 30일을 반환해야 함
        const marchResult = getNextRecurrenceDate(new Date('2024-01-30'), rule, 2);
        expect(marchResult).toEqual(new Date('2024-03-30'));
      });
    });

    describe('매년 반복', () => {
      it('다음 매년 반복 날짜를 올바르게 계산해야 한다', () => {
        const rule: RecurrenceRule = {
          type: 'yearly',
          interval: 1,
          startDate: new Date('2024-01-15'),
        };

        const result = getNextRecurrenceDate(new Date('2024-01-15'), rule, 1);
        expect(result).toEqual(new Date('2025-01-15'));
      });

      it('2월 29일을 올바르게 처리해야 한다 - 윤년에만 29일에 생성', () => {
        const rule: RecurrenceRule = {
          type: 'yearly',
          interval: 1,
          startDate: new Date('2024-02-29'), // 윤년
        };

        // 2025년 (윤년이 아님) - null을 반환해야 함
        const nonLeapResult = getNextRecurrenceDate(new Date('2024-02-29'), rule, 1);
        expect(nonLeapResult).toBeNull();

        // 2028년 (윤년) - 2월 29일을 반환해야 함
        const leapResult = getNextRecurrenceDate(new Date('2024-02-29'), rule, 4);
        expect(leapResult).toEqual(new Date('2028-02-29'));
      });

      it('윤년의 일반 날짜들을 처리해야 한다', () => {
        const rule: RecurrenceRule = {
          type: 'yearly',
          interval: 1,
          startDate: new Date('2024-01-15'),
        };

        const result = getNextRecurrenceDate(new Date('2024-01-15'), rule, 1);
        expect(result).toEqual(new Date('2025-01-15'));
      });
    });

    describe('종료 날짜 제약 조건', () => {
      it('종료 날짜 제약 조건을 준수해야 한다', () => {
        const rule: RecurrenceRule = {
          type: 'daily',
          interval: 1,
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-01-17'),
        };

        const result = getNextRecurrenceDate(new Date('2024-01-15'), rule, 3);
        expect(result).toBeNull(); // 종료 날짜를 초과함
      });

      it('최대 발생 횟수 제약 조건을 준수해야 한다', () => {
        const rule: RecurrenceRule = {
          type: 'daily',
          interval: 1,
          startDate: new Date('2024-01-15'),
          maxOccurrences: 3,
        };

        const result = getNextRecurrenceDate(new Date('2024-01-15'), rule, 3);
        expect(result).toBeNull(); // 최대 발생 횟수를 초과함
      });
    });
  });

  describe('getAllRecurrenceDates', () => {
    it('반복되지 않는 이벤트의 경우 단일 날짜를 반환해야 한다', () => {
      const rule: RecurrenceRule = {
        type: 'none',
        interval: 1,
        startDate: new Date('2024-01-15'),
      };

      const result = getAllRecurrenceDates(rule);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(new Date('2024-01-15'));
    });

    it('모든 매일 반복 날짜를 계산해야 한다', () => {
      const rule: RecurrenceRule = {
        type: 'daily',
        interval: 1,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-17'),
      };

      const result = getAllRecurrenceDates(rule);
      expect(result).toHaveLength(3);
      expect(result).toEqual([
        new Date('2024-01-15'),
        new Date('2024-01-16'),
        new Date('2024-01-17'),
      ]);
    });

    it('31일 제약 조건이 있는 매월 반복을 처리해야 한다', () => {
      const rule: RecurrenceRule = {
        type: 'monthly',
        interval: 1,
        startDate: new Date('2024-01-31'),
        endDate: new Date('2024-04-30'),
      };

      const result = getAllRecurrenceDates(rule);
      // 31일이 있는 월만 포함해야 함
      expect(result).toEqual([
        new Date('2024-01-31'),
        new Date('2024-03-31'),
        // 2월과 4월은 31일이 없음
      ]);
    });
  });

  describe('isRecurrenceDate', () => {
    it('반복 날짜를 올바르게 식별해야 한다', () => {
      const rule: RecurrenceRule = {
        type: 'daily',
        interval: 1,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-17'),
      };

      expect(isRecurrenceDate(new Date('2024-01-15'), rule)).toBe(true);
      expect(isRecurrenceDate(new Date('2024-01-16'), rule)).toBe(true);
      expect(isRecurrenceDate(new Date('2024-01-18'), rule)).toBe(false);
    });
  });

  describe('findNextRecurrenceDate', () => {
    it('주어진 날짜 이후의 다음 발생 날짜를 찾아야 한다', () => {
      const rule: RecurrenceRule = {
        type: 'daily',
        interval: 1,
        startDate: new Date('2024-01-15'),
      };

      const result = findNextRecurrenceDate(new Date('2024-01-16'), rule);
      expect(result).toEqual(new Date('2024-01-17'));
    });

    it('더 이상 발생이 없으면 null을 반환해야 한다', () => {
      const rule: RecurrenceRule = {
        type: 'daily',
        interval: 1,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-17'),
      };

      const result = findNextRecurrenceDate(new Date('2024-01-18'), rule);
      expect(result).toBeNull();
    });
  });
});
