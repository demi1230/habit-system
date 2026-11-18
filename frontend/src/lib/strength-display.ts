/**
 * How the heuristic habit-strength estimate is shown. "Insufficient data" is
 * a state of its own: a habit without enough evidence is not "weak".
 */
export type StrengthStage = 'weak' | 'building' | 'strong' | 'insufficient_data';

export function strengthStageLabel(stage: StrengthStage): string {
  switch (stage) {
    case 'strong':
      return 'Хүчтэй';
    case 'building':
      return 'Хөгжиж буй';
    case 'weak':
      return 'Сул';
    default:
      return 'Өгөгдөл хангалтгүй';
  }
}

export function strengthStageColor(stage: StrengthStage): string {
  switch (stage) {
    case 'strong':
      return '#18A68A';
    case 'building':
      return '#E8A87C';
    case 'weak':
      return '#D94F6E';
    default:
      return 'var(--text-placeholder)';
  }
}

/** Stage for a 0–100 score, or insufficient data when there is no score. */
export function strengthStageOf(score: number | null): StrengthStage {
  if (score === null) return 'insufficient_data';
  if (score >= 70) return 'strong';
  if (score >= 40) return 'building';
  return 'weak';
}

/** What is still needed before the estimate can be computed. */
export function missingEvidenceHint(composite: {
  srbaiScore: number | null;
  consistencyScore: number | null;
  scheduledDays?: number;
}): string {
  if (composite.srbaiScore === null) {
    return 'Автоматжилтын (SRBAI) үнэлгээ өгсний дараа тооцоолно.';
  }
  if (composite.consistencyScore === null) {
    const days = composite.scheduledDays ?? 0;
    return `Дор хаяж 7 төлөвлөсөн өдөр хэрэгтэй (одоо ${days}).`;
  }
  return '';
}
