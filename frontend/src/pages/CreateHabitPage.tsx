import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { habitsApi, type CreateHabitPayload } from '@/api/habits';
import { HabitFormPage, type HabitFormInitialValues } from './HabitFormPage';

export function CreateHabitPage() {
  const { userId } = useAuth();
  const location = useLocation();
  const template = (location.state as { template?: HabitFormInitialValues } | null)?.template;

  const handleSubmit = async (payload: Partial<CreateHabitPayload>) => {
    if (!userId) throw new Error('Нэвтрэх шаардлагатай');
    await habitsApi.createHabit(userId, payload as CreateHabitPayload);
  };

  return (
    <HabitFormPage
      pageTitle="Дадал нэмэх"
      submitLabel="Хадгалах"
      mode="create"
      initialValues={template ?? {}}
      onSubmit={handleSubmit}
    />
  );
}
