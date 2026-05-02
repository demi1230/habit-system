import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { habitsApi } from '@/api/habits';
import type { CreateHabitPayload } from '@/api/habits';
import type { Habit } from '@/api/types';
import { HabitFormPage, type HabitFormInitialValues } from './HabitFormPage';

function mapHabitToInitialValues(h: Habit): HabitFormInitialValues {
  const activeCues = h.cues.filter(c => c.isActive);

  const timeWindows = activeCues
    .filter(c => c.startTime && c.endTime)
    .map(c => ({ start: c.startTime!.slice(0, 5), end: c.endTime!.slice(0, 5) }));

  const selectedLocations = activeCues
    .filter(c => c.coarseLocation)
    .map(c => ({ lat: 0, lng: 0, label: c.coarseLocation! }));

  return {
    title: h.title,
    precedingRoutine: h.precedingRoutine ?? '',
    reason: h.motivationProfile?.reason ?? '',
    colorId: h.color || 'lavender',
    selectedEmoji: h.iconValue || '🧘',
    benefits: h.benefits ?? [],
    steps: h.steps?.map(step => step.title) ?? [],
    selectedDays: h.scheduleDays.map(s => s.weekday),
    reminderEnabled: h.reminderEnabled,
    timeWindows,
    selectedLocations,
    habitType: 'measurable',
    targetNum: String(h.targetValue),
    minNum: h.minimumTarget > 1 ? String(h.minimumTarget) : '',
    targetUnit: h.measurementUnit || 'удаа',
  };
}

export function EditHabitPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { userId } = useAuth();
  const backTo = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const [initialValues, setInitialValues] = useState<HabitFormInitialValues | null>(null);

  useEffect(() => {
    if (!userId || !id) return;
    habitsApi.getHabit(userId, id).then(h => {
      setInitialValues(mapHabitToInitialValues(h));
    });
  }, [userId, id]);

  const handleSubmit = async (payload: Partial<CreateHabitPayload>) => {
    if (!userId || !id) throw new Error('Нэвтрэх шаардлагатай');
    await habitsApi.updateHabit(userId, id, payload);
  };

  if (!initialValues) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground" style={{ fontSize: 14 }}>Уншиж байна...</p>
      </div>
    );
  }

  return (
    <HabitFormPage
      pageTitle="Дадал засах"
      submitLabel="Хадгалах"
      mode="edit"
      initialValues={initialValues}
      onSubmit={handleSubmit}
      onSuccess={() => navigate(`/habit/${id}`, { state: { from: backTo }, replace: true })}
    />
  );
}
