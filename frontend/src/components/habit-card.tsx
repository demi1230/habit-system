import { Check, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Habit } from '@/api/types';
import { HabitIconSlot } from '@/components/habit-icon-slot';
import { getHabitColor } from '@/lib/habit-colors';
import { TYPOGRAPHY, buttonStyles } from '@/shared/design';

interface HabitCardProps {
  habit: Habit;
  onQuickComplete?: (id: string) => void;
  todayCompleted?: boolean;
  currentValue?: number;
}

export function HabitCard({ habit, onQuickComplete, todayCompleted, currentValue }: HabitCardProps) {
  const navigate = useNavigate();
  const color = getHabitColor(habit.color);

  return (
    <div
      className={`bg-card rounded-2xl p-4 shadow-sm border border-border transition-all ${todayCompleted ? 'opacity-70' : ''}`}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickComplete?.(habit.id);
          }}
          className={`shrink-0 transition-all ${buttonStyles({ variant: todayCompleted ? 'default' : 'outline', size: 'iconLg' })} ${
            todayCompleted
              ? ''
              : 'border-2 border-border hover:border-primary'
          }`}
        >
          {todayCompleted ? (
            <Check className="w-5 h-5" />
          ) : (
            <HabitIconSlot iconValue={habit.iconValue} emojiSizePx={16} circlePx={16} />
          )}
        </button>

        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => navigate(`/habit/${habit.id}`)}
        >
          <div className="flex items-center gap-2">
            <h4 className={todayCompleted ? 'line-through text-muted-foreground' : ''}>
              {habit.title}
            </h4>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {habit.targetValue > 0 && habit.measurementUnit !== 'boolean' && (
              <span className="text-muted-foreground" style={TYPOGRAPHY.caption}>
                {habit.targetValue} {habit.measurementUnit}
              </span>
            )}
          </div>
        </div>

        <ChevronRight
          className="w-4 h-4 text-muted-foreground shrink-0 cursor-pointer"
          onClick={() => navigate(`/habit/${habit.id}`)}
        />
      </div>

      {habit.targetValue > 0 && habit.measurementUnit !== 'boolean' && !todayCompleted && (
        <div className="mt-3 ml-14">
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(((currentValue || 0) / habit.targetValue) * 100, 100)}%`,
                backgroundColor: color.accent,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
