import { ReflectionEntity } from '../entities/reflection.entity';

export const REFLECTION_REPOSITORY = Symbol('IReflectionRepository');

export interface CreateReflectionData {
  userId: string;
  habitId: string;
  logId: string;
  text: string;
  occurredAt: Date;
}

export interface IReflectionRepository {
  create(data: CreateReflectionData): Promise<ReflectionEntity>;
  findAllByHabitId(habitId: string): Promise<ReflectionEntity[]>;
}
