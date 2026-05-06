import { parseRoutineCue } from './routine-cue';

export interface ReminderPreviewInput {
  title?: string | null;
  precedingRoutine?: string | null;
  reason?: string | null;
  benefits?: string[];
}

export function buildReminderPreview(input: ReminderPreviewInput) {
  const habit = input.title?.trim() || 'дадал';
  const rawCue = input.precedingRoutine?.trim() || null;
  const parsedCue = rawCue ? parseRoutineCue(rawCue) : null;
  const cue = parsedCue ? `${parsedCue.activity} ${parsedCue.timing}` : null;
  const reason = input.reason?.trim() || null;
  const benefits = (input.benefits ?? []).filter((benefit) => benefit.trim().length > 0);

  const base = `${habit} дадлаа хийгээрэй.`;
  const withCue = cue ? `${cue} ${habit} дадлаа хийгээрэй.` : base;
  const withReason = reason ? `${withCue} Ингэснээр та ${reason}.` : withCue;
  const withBenefits =
    benefits.length > 0
      ? `${withCue} Энэ дадал нь ${benefits.join(', ')} ашиг тустай.`
      : withCue;

  return {
    base,
    cueAndReason: withReason,
    cueAndBenefits: withBenefits,
  };
}
