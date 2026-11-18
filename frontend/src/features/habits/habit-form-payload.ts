/**
 * Pure mapping between the habit form and the habits API, kept out of the
 * page component so it can be tested.
 *
 * API contract reminder: on PATCH, an omitted (`undefined`) field means
 * "unchanged". To clear a value in edit mode the form therefore sends an
 * explicit empty value (`''` or `[]`).
 */
import type { CreateHabitPayload } from '@/api/habits';
import type { Habit, Weekday } from '@/api/types';
import { encodeRoutineCue, type RoutineTiming } from '@/lib/routine-cue';

export interface HabitFormValues {
  title: string;
  precedingRoutine: string;
  routineTiming: RoutineTiming;
  reason: string;
  colorId: string;
  selectedEmoji: string;
  benefits: string[];
  steps: string[];
  selectedDays: Weekday[];
  reminderEnabled: boolean;
  timeWindows: Array<{ start: string; end: string }>;
  selectedLocations: Array<{ lat: number; lng: number; label: string }>;
  habitType: 'binary' | 'measurable';
  targetNum: string;
  minNum: string;
  targetUnit: string;
}

/** Pre-filled values for edit mode or template-driven create mode. */
export type HabitFormInitialValues = Partial<HabitFormValues>;

export const MIN_ABOVE_TARGET_MESSAGE =
  'Доод хэмжээ нь зорилтот хэмжээнээс их байж болохгүй.';

function targetValueOf(values: HabitFormValues): number {
  return values.habitType === 'binary' ? 1 : parseFloat(values.targetNum) || 1;
}

/**
 * Checks the targets before saving. Returns a Mongolian message the user can
 * act on, or null when the values are valid.
 */
export function validateHabitTargets(values: HabitFormValues): string | null {
  if (values.habitType !== 'measurable' || values.minNum.trim() === '') {
    return null;
  }
  const minimum = parseFloat(values.minNum);
  if (Number.isFinite(minimum) && minimum > targetValueOf(values)) {
    return MIN_ABOVE_TARGET_MESSAGE;
  }
  return null;
}

export function buildHabitPayload(
  values: HabitFormValues,
  options: { mode: 'create' | 'edit'; today: string },
): Partial<CreateHabitPayload> {
  const isCreate = options.mode === 'create';
  // In create mode an empty value is simply omitted; in edit mode it is sent
  // so that clearing a field is actually saved.
  const emptyUnlessEdit = <T>(value: T, isEmpty: boolean): T | undefined =>
    isEmpty && isCreate ? undefined : value;

  const timeWindows = values.timeWindows
    .filter((tw) => tw.start && tw.end)
    .map((tw) => ({ startTime: tw.start, endTime: tw.end }));
  const locations = values.selectedLocations.map((l) => ({
    lat: l.lat,
    lng: l.lng,
    label: l.label,
  }));

  const targetValue = targetValueOf(values);
  const parsedMinimum =
    values.habitType === 'measurable' && values.minNum.trim() !== ''
      ? parseFloat(values.minNum)
      : NaN;
  // Without an explicit minimum, one unit counts as done. It is capped at the
  // target so small targets (e.g. 0.5 л) remain valid.
  const minimumTarget = Number.isFinite(parsedMinimum)
    ? parsedMinimum
    : Math.min(1, targetValue);

  return {
    title: values.title.trim(),
    precedingRoutine: values.precedingRoutine
      ? encodeRoutineCue(values.precedingRoutine, values.routineTiming)
      : emptyUnlessEdit('', true),
    reason: values.reason ? values.reason : emptyUnlessEdit('', true),
    color: values.colorId,
    iconType: 'EMOJI',
    iconValue: values.selectedEmoji,
    benefits: emptyUnlessEdit(values.benefits, values.benefits.length === 0),
    measurementUnit: values.habitType === 'binary' ? 'удаа' : values.targetUnit,
    targetValue,
    minimumTarget,
    ...(isCreate ? { startDate: options.today } : {}),
    scheduleDays: values.selectedDays.map((weekday) => ({ weekday })),
    steps: values.steps
      .map((step, orderIndex) => ({ title: step.trim(), orderIndex }))
      .filter((step) => step.title.length > 0),
    reminder: {
      enabled: values.reminderEnabled,
      timeWindows: emptyUnlessEdit(timeWindows, timeWindows.length === 0),
      locations: emptyUnlessEdit(locations, locations.length === 0),
    },
  };
}

/** Form values for editing an existing habit. */
export function habitToFormValues(habit: Habit): HabitFormInitialValues {
  const activeCues = habit.cues.filter((c) => c.isActive);

  const timeWindows = activeCues
    .filter((c) => c.startTime && c.endTime)
    .map((c) => ({ start: c.startTime!.slice(0, 5), end: c.endTime!.slice(0, 5) }));

  // Keep the saved coordinates: reminders only fire near these points.
  const selectedLocations = activeCues
    .filter((c) => c.locationLat != null && c.locationLng != null)
    .map((c) => ({
      lat: c.locationLat!,
      lng: c.locationLng!,
      label: c.coarseLocation ?? 'Байршил',
    }));

  return {
    title: habit.title,
    precedingRoutine: habit.precedingRoutine ?? '',
    reason: habit.motivationProfile?.reason ?? '',
    colorId: habit.color || 'lavender',
    selectedEmoji: habit.iconValue || '🧘',
    benefits: habit.benefits ?? [],
    steps: habit.steps?.map((step) => step.title) ?? [],
    selectedDays: habit.scheduleDays.map((s) => s.weekday),
    reminderEnabled: habit.reminderEnabled,
    timeWindows,
    selectedLocations,
    habitType: 'measurable',
    targetNum: String(habit.targetValue),
    // An empty field means "one unit" (see buildHabitPayload); any other
    // stored minimum, including values below 1, is shown so it is preserved.
    minNum: habit.minimumTarget === 1 ? '' : String(habit.minimumTarget),
    targetUnit: habit.measurementUnit || 'удаа',
  };
}
