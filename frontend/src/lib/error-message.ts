export function errorMessage(error: unknown, fallback = 'Хадгалж чадсангүй. Дахин оролдоно уу.'): string {
  if (!navigator.onLine || error instanceof TypeError) return 'Холболтоо шалгаад дахин оролдоно уу.';
  const status = (error as { status?: number } | null)?.status;
  if (status === 429) return 'Түр хүлээгээд дахин оролдоно уу.';
  if (status === 403) return 'Энэ үйлдлийг хийх эрхгүй байна.';
  return fallback;
}
