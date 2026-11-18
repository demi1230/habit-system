import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { habitsApi } from '@/api/habits';
import type { CreateHabitPayload } from '@/api/habits';
import { InlineError } from '@/components/inline-error';
import { errorMessage } from '@/lib/error-message';
import { habitToFormValues } from '@/features/habits/habit-form-payload';
import { HabitFormPage, type HabitFormInitialValues } from './HabitFormPage';

export function EditHabitPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { userId } = useAuth();
  const backTo = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const [initialValues, setInitialValues] = useState<HabitFormInitialValues | null>(null);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!userId || !id) return;
    let cancelled = false;
    habitsApi
      .getHabit(userId, id)
      .then(h => {
        if (!cancelled) setInitialValues(habitToFormValues(h));
      })
      .catch(err => {
        if (!cancelled) {
          setLoadError(errorMessage(err, 'Дадлыг ачаалж чадсангүй. Дахин оролдоно уу.'));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [userId, id, reloadKey]);

  const retryLoad = useCallback(() => {
    setLoadError('');
    setReloadKey(k => k + 1);
  }, []);

  const handleSubmit = async (payload: Partial<CreateHabitPayload>) => {
    if (!userId || !id) throw new Error('Нэвтрэх шаардлагатай');
    await habitsApi.updateHabit(userId, id, payload);
  };

  if (loadError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <InlineError message={loadError} onRetry={retryLoad} />
      </div>
    );
  }

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
