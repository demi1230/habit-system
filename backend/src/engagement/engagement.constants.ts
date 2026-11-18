import type { Logger } from '@nestjs/common';

export const ENGAGEMENT_SERVICE = Symbol('ENGAGEMENT_SERVICE');

export interface CompletionRewardParams {
  userId: string;
  habitId: string;
  completedAt: Date;
  logId: string;
}

export interface IEngagementService {
  awardCompletionRewards(params: CompletionRewardParams): Promise<unknown>;
}

/**
 * XP and badges are secondary to the completion itself. Callers use this
 * after the log is saved, so a reward failure is logged instead of turning a
 * successful save into an error (which would make the client roll back and
 * retry).
 */
export async function awardCompletionRewardsSafely(
  engagementService: IEngagementService,
  logger: Pick<Logger, 'warn'>,
  params: CompletionRewardParams,
): Promise<void> {
  try {
    await engagementService.awardCompletionRewards(params);
  } catch (error) {
    logger.warn(
      `Completion rewards failed for log ${params.logId}: ${String(error)}`,
    );
  }
}
