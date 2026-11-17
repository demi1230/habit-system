import type { Weekday } from '@/api/types';

/** Monday-first weekday order with Mongolian short labels. */
export const WEEKDAYS: ReadonlyArray<{ en: Weekday; mn: string }> = [
  { en: 'MONDAY',    mn: 'Да' },
  { en: 'TUESDAY',   mn: 'Мя' },
  { en: 'WEDNESDAY', mn: 'Лх' },
  { en: 'THURSDAY',  mn: 'Пү' },
  { en: 'FRIDAY',    mn: 'Ба' },
  { en: 'SATURDAY',  mn: 'Бя' },
  { en: 'SUNDAY',    mn: 'Ня' },
];

export const WEEKDAY_KEYS: Weekday[] = WEEKDAYS.map(d => d.en);
export const WORKDAY_KEYS: Weekday[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
