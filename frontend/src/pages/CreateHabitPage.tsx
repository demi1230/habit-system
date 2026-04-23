import { useAuth } from '@/context/AuthContext';
import { habitsApi, type CreateHabitPayload } from '@/api/habits';
import { HabitFormPage } from './HabitFormPage';

export function CreateHabitPage() {
  const { userId } = useAuth();

  const handleSubmit = async (payload: Partial<CreateHabitPayload>) => {
    if (!userId) throw new Error('Нэвтрэх шаардлагатай');
    await habitsApi.createHabit(userId, payload as CreateHabitPayload);
  };

  return (
    <HabitFormPage
      pageTitle="Дадал нэмэх"
      submitLabel="Хадгалах"
      onSubmit={handleSubmit}
      // onSuccess not provided -> shows success animation then navigates to /dashboard
    />
  );
}
