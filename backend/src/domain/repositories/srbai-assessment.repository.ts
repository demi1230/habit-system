import { SrbaiAssessmentEntity } from '../entities/srbai-assessment.entity';

/** Injection token for the SRBAI assessment repository port. */
export const SRBAI_ASSESSMENT_REPOSITORY = Symbol('ISrbaiAssessmentRepository');

export interface CreateSrbaiAssessmentData {
  userId: string;
  habitId: string;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  rawAverage: number;
  normalizedScore100: number;
  assessedAt: Date;
}

/**
 * Repository port (interface) for SrbaiAssessmentEntity persistence.
 */
export interface ISrbaiAssessmentRepository {
  create(data: CreateSrbaiAssessmentData): Promise<SrbaiAssessmentEntity>;
  findLatestByHabitId(habitId: string): Promise<SrbaiAssessmentEntity | null>;
  findAllByHabitId(habitId: string): Promise<SrbaiAssessmentEntity[]>;
}
