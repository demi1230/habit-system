/**
 * Domain entity — Reflection
 * A free-text post-completion reflection linked to a habit log entry.
 * Thesis mapping: "Тусгал · Reflection"
 */
export interface ReflectionEntity {
  id: string;
  userId: string;
  habitId: string;
  logId: string;
  text: string;
  occurredAt: Date;
  createdAt: Date;
}
