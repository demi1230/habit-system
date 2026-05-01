import type { DifficultyRating } from '@/api/types';
import type { CelebrationContext } from './types';

// ── Mongolian copy ────────────────────────────────────────────

interface CelebrationCopy {
  headline: string;
  subline: string;
  detail: string;
  badgeLabel?: string;
}

const REGULAR_HEADLINES = [
  'Гал гал лаажийншдээ',
  'Янзын байна шүү!',
  'Ваа мундаг байна шүү!',
  'Тиймээ чи чадлаа!',
  'Наааяс!',
  'Фантастик бээеби!',
  'Лаажийншүү бро!',
];

export function getCelebrationCopy(ctx: CelebrationContext, habitTitle: string): CelebrationCopy {
  if (ctx.mode === 'milestone') {
    if (ctx.milestoneKind === 'first') {
      return {
        headline: 'Гайхалтай эхлэл!',
        subline: `“${habitTitle}” — анхны давталт амжилттай.`,
        detail: 'Хамгийн хэцүү алхам бол эхний алхам. Чи тэгсэн.',
        badgeLabel: 'Анхны давталт',
      };
    }
    if (ctx.milestoneKind === 'streak') {
      return {
        headline: 'Гайхалтай!',
        subline: `“${habitTitle}” — ${ctx.milestoneValue} өдөр дараалан хийлээ.`,
        detail: 'Тогтмол давталт бол дадал бэхжих хамгийн чухал алхам.',
        badgeLabel: `${ctx.milestoneValue} өдрийн дараалал`,
      };
    }
    // count milestone
    return {
      headline: 'Сайхан!',
      subline: `“${habitTitle}” — нийт ${ctx.milestoneValue} удаа хийлээ.`,
      detail: 'Тусгал бол дадлын тогтвортой байдлын нотолгоо.',
      badgeLabel: `${ctx.milestoneValue} давталт`,
    };
  }

  // Regular — headline varies by streak, subline = habit name
  const headline = REGULAR_HEADLINES[ctx.streak % REGULAR_HEADLINES.length];
  return {
    headline,
    subline: habitTitle,
    detail: 'Өнөөдрийн давталт дадлыг бэхжүүлж байна.',
  };
}

// ── Feel chips ────────────────────────────────────────────────

export const FEEL_CHIPS: { id: string; label: string }[] = [
  { id: 'focused',  label: 'Анхаарал сайжирсан' },
  { id: 'energy',   label: 'Илүү эрч хүчтэй' },
  { id: 'calm',     label: 'Илүү тайван' },
  { id: 'content',  label: 'Сэтгэл амар' },
];

// ── Difficulty options ────────────────────────────────────────

export const DIFFICULTY_OPTIONS: { value: DifficultyRating; emoji: string; label: string }[] = [
  { value: 'very_easy', emoji: '😎', label: 'Амархан' },
  { value: 'easy',      emoji: '🙂', label: 'Хөнгөн' },
  { value: 'moderate',  emoji: '😐', label: 'Дунд' },
  { value: 'hard',      emoji: '😤', label: 'Хэцүү' },
  { value: 'very_hard', emoji: '🥵', label: 'Маш хэцүү' },
];
