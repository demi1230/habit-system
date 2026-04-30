import { Injectable } from '@nestjs/common';
import { HabitEntity } from '../domain/entities/habit.entity';

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
    const precedingRoutine =
      cue?.precedingRoutine ?? habit.precedingRoutine ?? null;
    const reason = habit.motivationProfile?.reason?.trim() || null;
    const benefits = habit.benefits.filter(
      (benefit) => benefit.trim().length > 0,
    );

    const firstSentence = precedingRoutine
      ? `${precedingRoutine}-ын дараа ${habit.title} дадлаа хийгээрэй.`
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
        cue: precedingRoutine,
        habit: habit.title,
        reason,
        benefits,
      },
    };
  }
}
