/**
 * Domain entity — DifficultyFeedback
 * A subjective difficulty rating submitted after completing a habit log entry.
 * Thesis mapping: "Хэцүүдэлт үнэлгээ · Difficulty feedback"
 */
export interface DifficultyFeedbackEntity {
  id: string;
  userId: string;
  habitId: string;
  logId: string;
  rating: string; // DifficultyRating value
  note: string | null;
  occurredAt: Date;
  createdAt: Date;
}
