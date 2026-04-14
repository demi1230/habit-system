import { Check, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Habit, getTagById } from '../store';

interface HabitCardProps {
  habit: Habit;
  onQuickComplete?: (id: string) => void;
  todayCompleted?: boolean;
}

export function HabitCard({ habit, onQuickComplete, todayCompleted }: HabitCardProps) {
  const navigate = useNavigate();
  const tag = getTagById(habit.goalTag);
  const tagColor = tag?.color || '#6B9B8A';
  const tagEmoji = tag?.emoji || '✨';

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
          {todayCompleted ? <Check className="w-5 h-5" /> : <span style={{ fontSize: '16px' }}>{tagEmoji}</span>}
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
            <span
              className="px-2 py-0.5 rounded-full text-white flex items-center gap-1"
              style={{ backgroundColor: tagColor, fontSize: '11px' }}
            >
              <span>{tagEmoji}</span> {tag?.name || habit.goalTag}
            </span>
            {habit.type === 'measurable' && (
              <span className="text-muted-foreground" style={{ fontSize: '12px' }}>
                {habit.targetValue} {habit.unit}
              </span>
            )}
            {habit.streak > 0 && (
              <span className="text-primary" style={{ fontSize: '12px' }}>
                🔥 {habit.streak} day streak
              </span>
            )}
          </div>
        </div>

        <ChevronRight
          className="w-4 h-4 text-muted-foreground shrink-0 cursor-pointer"
          onClick={() => navigate(`/habit/${habit.id}`)}
        />
      </div>

      {habit.type === 'measurable' && !todayCompleted && (
        <div className="mt-3 ml-14">
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min((habit.completions[0]?.value || 0) / (habit.targetValue || 1) * 100, 100)}%`,
                backgroundColor: tagColor,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
