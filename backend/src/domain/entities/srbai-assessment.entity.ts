/**
 * Domain entity — SrbaiAssessment
 * Represents one Self-Report Behavioral Automaticity Index (SRBAI) rating.
 * Four 7-point Likert items are averaged and normalised to 0–100.
 *
 * Thesis mapping: "SRBAI үнэлгээ · SRBAI assessment" from the habit-strength layer.
 */
export interface SrbaiAssessmentEntity {
  id: string;
  userId: string;
  habitId: string;
  /** Items are Likert 1–7. */
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  /** Mean of items 1-4. */
  rawAverage: number;
  /** ((rawAverage - 1) / 6) * 100, rounded to 2 dp. */
  normalizedScore100: number;
  assessedAt: Date;
  createdAt: Date;
}
