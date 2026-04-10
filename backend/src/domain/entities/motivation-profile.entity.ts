/**
 * Domain entity — MotivationProfileEntity
 * Captures the user's personal motivation context for a habit (WHY layer
 * from the thesis behavioral model).
 */
export interface MotivationProfileEntity {
  id: string;
  habitId: string;
  goalTag: string | null;
  personalReason: string | null;
  identityStatement: string | null;
  createdAt: Date;
  updatedAt: Date;
}
