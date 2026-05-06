import { Injectable } from '@nestjs/common';
import { HabitEntity } from '../domain/entities/habit.entity';

const TIMING_SEP = '|||';
const VALID_TIMINGS = ['дараа', 'өмнө', 'үедээ'] as const;
type RoutineTiming = (typeof VALID_TIMINGS)[number];

function parseRoutineCue(stored: string): { activity: string; timing: RoutineTiming } {
  if (stored.includes(TIMING_SEP)) {
    const idx = stored.indexOf(TIMING_SEP);
    const activity = stored.slice(0, idx);
    const raw = stored.slice(idx + TIMING_SEP.length);
    const timing = VALID_TIMINGS.includes(raw as RoutineTiming)
      ? (raw as RoutineTiming)
      : 'дараа';
    return { activity, timing };
  }
  return { activity: stored, timing: 'дараа' };
}

@Injectable()
export class ReminderMessageBuilder {
  /**
   * Builds the push notification message for a habit reminder.
   *
   * The second sentence rotates across available variants (reason / each benefit)
   * using the current hour so the message feels fresh throughout the day without
   * requiring an extra DB query for a send-count.
   */
  build(habit: HabitEntity, rotationSeed = Date.now()) {
    const cue =
      habit.cues.find((item) => item.isActive && item.precedingRoutine) ?? null;
    const rawRoutine =
      cue?.precedingRoutine ?? habit.precedingRoutine ?? null;
    const reason = habit.motivationProfile?.reason?.trim() || null;
    const benefits = habit.benefits.filter(
      (benefit) => benefit.trim().length > 0,
    );

    const firstSentence = rawRoutine
      ? (() => {
          const { activity, timing } = parseRoutineCue(rawRoutine);
          return `${activity} ${timing} ${habit.title} дадлаа хийгээрэй.`;
        })()
      : `${habit.title} дадлаа хийгээрэй.`;

    // Build all available second-sentence variants
    const variants: string[] = [];
    if (reason) {
      variants.push(`Ингэснээр та ${reason}.`);
    }
    for (const benefit of benefits) {
      variants.push(`Энэ дадал нь ${benefit} ашиг тустай.`);
    }

    // Rotate by hour (0–23) so the same reminder window doesn't repeat the same text
    const hourOfDay = new Date(rotationSeed).getHours();
    const secondSentence =
      variants.length > 0 ? variants[hourOfDay % variants.length] : null;

    return {
      title: habit.title,
      body: [firstSentence, secondSentence].filter(Boolean).join(' '),
      contentParts: {
        cue: rawRoutine ? parseRoutineCue(rawRoutine).activity : null,
        habit: habit.title,
        reason,
        benefits,
      },
    };
  }
}
