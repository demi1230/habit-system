import { Check, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Habit } from '@/api/types';
import { getHabitColor } from '@/lib/habit-colors';

interface HabitCardProps {
  habit: Habit;
  onQuickComplete?: (id: string) => void;
  todayCompleted?: boolean;
  currentValue?: number;
}

export function HabitCard({ habit, onQuickComplete, todayCompleted, currentValue }: HabitCardProps) {
  const navigate = useNavigate();
  const color = getHabitColor(habit.color);
  const habitIcon = habit.iconValue || '✨';

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
          className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all ${
            todayCompleted
              ? 'bg-primary text-primary-foreground'
              : 'border-2 border-border hover:border-primary'
          }`}
        >
          {todayCompleted ? <Check className="w-5 h-5" /> : <span style={{ fontSize: '16px' }}>{habitIcon}</span>}
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
              <span className="text-muted-foreground" style={{ fontSize: '12px' }}>
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
