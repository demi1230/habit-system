import { Injectable } from '@nestjs/common';
import { HabitEntity } from '../domain/entities/habit.entity';

@Injectable()
export class ReminderMessageBuilder {
  build(habit: HabitEntity) {
    const cue =
      habit.cues.find((item) => item.isActive && item.precedingRoutine) ??
      null;
    const precedingRoutine =
      cue?.precedingRoutine ?? habit.precedingRoutine ?? null;
    const reason = habit.motivationProfile?.reason?.trim() || null;
    const benefits = habit.benefits.filter((benefit) => benefit.trim().length > 0);

    const firstSentence = precedingRoutine
      ? `${precedingRoutine}-ын дараа ${habit.title} дадлаа хийгээрэй.`
      : `${habit.title} дадлаа хийгээрэй.`;

    let secondSentence: string | null = null;
    if (reason) {
      secondSentence = `Ингэснээр та ${reason}.`;
    } else if (benefits.length > 0) {
      secondSentence = `Энэ дадал нь ${benefits.join(', ')} ашиг тустай.`;
    }

    return {
      title: 'Дадлын сануулга',
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
