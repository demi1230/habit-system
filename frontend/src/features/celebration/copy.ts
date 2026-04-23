import type { DifficultyRating } from '@/api/types';
import type { CelebrationContext } from './types';

// ── Mongolian copy ────────────────────────────────────────────

interface CelebrationCopy {
  headline: string;
  subline: string;
  detail: string;
  badgeIcon?: string;
  badgeLabel?: string;
}

export function getCelebrationCopy(ctx: CelebrationContext, habitTitle: string): CelebrationCopy {
  if (ctx.mode === 'milestone') {
    if (ctx.milestoneKind === 'first') {
      return {
        headline: 'Гайхалтай эхлэл!',
        subline: `"${habitTitle}" анх удаа бүртгэгдлээ.`,
        detail: 'Хамгийн хэцүү алхам бол эхний алхам. Чи тэгсэн.',
        badgeIcon: '🌱',
        badgeLabel: 'Анхны давталт',
      };
    }
    if (ctx.milestoneKind === 'streak') {
      return {
        headline: 'Гайхалтай!',
        subline: `${ctx.milestoneValue} өдөр дараалан хийлээ.`,
        detail: 'Тогтмол давталт бол дадал бэхжих хамгийн чухал алхам.',
        badgeIcon: '🔥',
        badgeLabel: `${ctx.milestoneValue} өдрийн дараалал`,
      };
    }
    // count milestone
    return {
      headline: 'Сайхан!',
      subline: `"${habitTitle}" нийт ${ctx.milestoneValue} удаа хийгдлээ.`,
      detail: 'Тусгал бол дадлын тогтвортой байдлын нотолгоо.',
      badgeIcon: '✓',
      badgeLabel: `${ctx.milestoneValue} давталт`,
    };
  }

  // Regular
  if (ctx.triggerSource === 'SELF_INITIATED') {
    return {
      headline: 'Маш сайн!',
      subline: 'Сануулгагүйгээр өөрийн санаачилгаар хийлээ.',
      detail: 'Энэ нь дадал дотооджиж эхэлж буйн сайн шинж.',
    };
  }

  return {
    headline: 'Сайн байна!',
    subline: `"${habitTitle}" амжилттай бүртгэгдлээ.`,
    detail: 'Өнөөдрийн давталт дадлыг бэхжүүлж байна.',
  };
}

// ── Feel chips ────────────────────────────────────────────────

export const FEEL_CHIPS: { id: string; label: string }[] = [
  { id: 'calm',    label: 'Илүү тайван' },
  { id: 'focused', label: 'Илүү төвлөрсөн' },
  { id: 'energy',  label: 'Илүү эрч хүчтэй' },
  { id: 'happy',   label: 'Сэтгэл хангалуун' },
];

// ── Difficulty options ────────────────────────────────────────

export const DIFFICULTY_OPTIONS: { value: DifficultyRating; emoji: string; label: string }[] = [
  { value: 'very_easy', emoji: '😎', label: 'Амархан' },
  { value: 'easy',      emoji: '🙂', label: 'Хөнгөн' },
  { value: 'moderate',  emoji: '😐', label: 'Дунд' },
  { value: 'hard',      emoji: '😤', label: 'Хэцүү' },
  { value: 'very_hard', emoji: '🥵', label: 'Маш хэцүү' },
];
