import { Circle } from 'lucide-react';

/** Renders the habit's chosen icon/emoji or a neutral placeholder (no decorative sparkle emoji). */
export function HabitIconSlot({
  iconValue,
  emojiSizePx,
  circlePx,
}: {
  iconValue?: string | null;
  emojiSizePx: number;
  circlePx: number;
}) {
  if (iconValue) {
    return <span style={{ fontSize: emojiSizePx, lineHeight: 1 }}>{iconValue}</span>;
  }
  return (
    <Circle
      width={circlePx}
      height={circlePx}
      strokeWidth={2}
      className="shrink-0"
      style={{ color: 'var(--text-muted-soft)' }}
    />
  );
}
