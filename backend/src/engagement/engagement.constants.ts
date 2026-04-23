export const ENGAGEMENT_SERVICE = Symbol('ENGAGEMENT_SERVICE');

export interface IEngagementService {
  awardCompletionRewards(params: {
    userId: string;
    habitId: string;
    completedAt: Date;
    logId: string;
  }): Promise<unknown>;
}
