import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { BadgeCode } from '../generated/prisma/client';

const DAILY_XP_REWARD = 10;

export interface CompletionRewardResult {
  xpAwarded: number;
  unlockedBadges: Array<{
    badgeCode: BadgeCode;
    awardedAt: Date;
    habitId: string | null;
  }>;
  totalXp: number;
}

@Injectable()
export class EngagementService {
  constructor(private readonly prisma: PrismaService) {}

  async awardCompletionRewards(params: {
    userId: string;
    habitId: string;
    completedAt: Date;
    logId: string;
  }): Promise<CompletionRewardResult> {
    return this.prisma.$transaction(async (tx) => {
      const dayStart = new Date(params.completedAt);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(params.completedAt);
      dayEnd.setHours(23, 59, 59, 999);

      const earlierDoneCount = await tx.habitLog.count({
        where: {
          id: { not: params.logId },
          status: 'DONE',
          completedAt: {
            gte: dayStart,
            lte: dayEnd,
          },
          habit: {
            userId: params.userId,
          },
        },
      });

      const xpAwarded = earlierDoneCount === 0 ? DAILY_XP_REWARD : 0;

      if (xpAwarded > 0) {
        await tx.user.update({
          where: { id: params.userId },
          data: {
            totalXp: {
              increment: xpAwarded,
            },
          },
        });
      }

      const [totalDoneCount, habitLogs, existingBadgeRows] = await Promise.all([
        tx.habitLog.count({
          where: {
            status: 'DONE',
            habit: {
              userId: params.userId,
            },
          },
        }),
        tx.habitLog.findMany({
          where: {
            status: 'DONE',
            habitId: params.habitId,
          },
          select: {
            completedAt: true,
          },
          orderBy: {
            completedAt: 'desc',
          },
          take: 60,
        }),
        tx.userBadge.findMany({
          where: {
            userId: params.userId,
          },
          select: {
            badgeCode: true,
          },
        }),
      ]);

      const existingBadges = new Set(
        existingBadgeRows.map((badge) => badge.badgeCode),
      );
      const currentStreak = this.computeStreak(
        habitLogs.map((log) => log.completedAt),
      );

      const badgeCandidates: Array<{
        badgeCode: BadgeCode;
        unlocked: boolean;
        habitId: string | null;
      }> = [
        {
          badgeCode: BadgeCode.FIRST_DONE,
          unlocked: totalDoneCount >= 1,
          habitId: params.habitId,
        },
        {
          badgeCode: BadgeCode.STREAK_7,
          unlocked: currentStreak >= 7,
          habitId: params.habitId,
        },
        {
          badgeCode: BadgeCode.STREAK_21,
          unlocked: currentStreak >= 21,
          habitId: params.habitId,
        },
        {
          badgeCode: BadgeCode.TOTAL_30,
          unlocked: totalDoneCount >= 30,
          habitId: null,
        },
      ].filter(
        (candidate) =>
          candidate.unlocked && !existingBadges.has(candidate.badgeCode),
      );

      const unlockedBadges: CompletionRewardResult['unlockedBadges'] = [];
      for (const candidate of badgeCandidates) {
        const badge = await tx.userBadge.create({
          data: {
            userId: params.userId,
            habitId: candidate.habitId,
            badgeCode: candidate.badgeCode,
          },
        });
        unlockedBadges.push({
          badgeCode: badge.badgeCode,
          awardedAt: badge.awardedAt,
          habitId: badge.habitId,
        });
      }

      const user = await tx.user.findUniqueOrThrow({
        where: { id: params.userId },
        select: { totalXp: true },
      });

      return {
        xpAwarded,
        unlockedBadges,
        totalXp: user.totalXp,
      };
    });
  }

  async getSummary(userId: string) {
    const [user, badges, subscriptionCount] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: {
          totalXp: true,
        },
      }),
      this.prisma.userBadge.findMany({
        where: { userId },
        include: {
          habit: {
            select: {
              title: true,
              iconValue: true,
              color: true,
            },
          },
        },
        orderBy: {
          awardedAt: 'desc',
        },
      }),
      this.prisma.pushSubscription.count({
        where: { userId },
      }),
    ]);

    return {
      totalXp: user.totalXp,
      unlockedBadgeCount: badges.length,
      subscriptionCount,
      badges: badges.map((badge) => ({
        id: badge.id,
        badgeCode: badge.badgeCode,
        awardedAt: badge.awardedAt,
        habitId: badge.habitId,
        habitTitle: badge.habit?.title ?? null,
        habitIcon: badge.habit?.iconValue ?? null,
        habitColor: badge.habit?.color ?? null,
      })),
      latestAchievements: badges.slice(0, 3).map((badge) => ({
        id: badge.id,
        type: 'badge',
        badgeCode: badge.badgeCode,
        awardedAt: badge.awardedAt,
        habitId: badge.habitId,
        habitTitle: badge.habit?.title ?? null,
      })),
    };
  }

  private computeStreak(completedDates: Date[]) {
    if (completedDates.length === 0) {
      return 0;
    }

    const uniqueDays = Array.from(
      new Set(
        completedDates.map((date) => {
          const normalized = new Date(date);
          normalized.setHours(0, 0, 0, 0);
          return normalized.toISOString();
        }),
      ),
    )
      .map((value) => new Date(value))
      .sort((a, b) => b.getTime() - a.getTime());

    let streak = 1;
    for (let index = 1; index < uniqueDays.length; index += 1) {
      const previousDay = uniqueDays[index - 1];
      const currentDay = uniqueDays[index];
      const dayDifference =
        (previousDay.getTime() - currentDay.getTime()) / 86_400_000;

      if (dayDifference === 1) {
        streak += 1;
        continue;
      }
      break;
    }

    return streak;
  }
}
