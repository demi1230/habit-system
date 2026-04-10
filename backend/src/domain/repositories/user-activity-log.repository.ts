/** Injection token for the user-activity-log repository port. */
export const USER_ACTIVITY_LOG_REPOSITORY = Symbol(
  'IUserActivityLogRepository',
);

export interface UserActivityLogEntity {
  id: string;
  userId: string;
  activityType: string;
  occurredAt: Date;
  createdAt: Date;
}

export interface CreateActivityLogData {
  userId: string;
  activityType: string;
  occurredAt: Date;
}

/**
 * Repository port (interface) for UserActivityLogEntity persistence.
 */
export interface IUserActivityLogRepository {
  create(data: CreateActivityLogData): Promise<UserActivityLogEntity>;
  findAllByUserId(userId: string): Promise<UserActivityLogEntity[]>;
}
