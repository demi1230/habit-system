import {
  Priority,
  ReasonCode,
  RecommendationCode,
} from '../enums/domain.enums';

/**
 * Domain rules — Learning recommendations
 * Priority-ordered rules that pick ONE primary recommendation for a habit
 * from observed signals. Pure and deterministic; the application service
 * gathers the signals and persists the result.
 *
 * Priority (first matching, not recently dismissed rule wins):
 *  1. REDUCE_TARGET              doneCount ≥ 5, recent difficulty hard, ≥ 50 % of
 *                                completions reach the minimum but not the target
 *  2. SIMPLIFY_HABIT             doneCount ≥ 5, recent difficulty hard
 *  3. REVIEW_REMINDER_DEPENDENCE doneCount ≥ 5, ≥ 70 % reminder-triggered
 *  4. ADJUST_CUE                 doneCount ≥ 5, context stability known and < 40
 *  5. INCREASE_SUPPORT           composite known and < 40, doneRate < 0.4
 *  6. BUILD_CONSISTENCY          doneCount ≥ 3, self-initiated < 0.4 or doneRate < 0.5
 *  7. BUILD_CONSISTENCY (start)  doneCount 1–2
 *  8. CELEBRATE_CONSISTENCY      doneCount is 7, 21 or 66
 *
 * Missing evidence (null) never triggers a rule.
 */

export const CONTEXT_STABILITY_LOW_THRESHOLD = 40;
/** A recommendation the user dismissed is not shown again for this long. */
export const DISMISSED_SUPPRESSION_DAYS = 7;

export interface RecommendationSignals {
  compositeScore: number | null;
  selfInitiatedRate: number;
  reminderDependenceRate: number;
  doneCount: number;
  doneRate: number;
  hardDifficulty: boolean;
  contextStabilityScore: number | null;
  partialDoneRate: number;
}

export interface RecommendationChoice {
  code: RecommendationCode;
  reasonCode: ReasonCode;
  title: string;
  message: string;
  priority: Priority;
  articleIds: string[];
}

export class RecommendationRules {
  /** Every matching recommendation, highest priority first. */
  static candidates(signals: RecommendationSignals): RecommendationChoice[] {
    const {
      compositeScore,
      selfInitiatedRate,
      reminderDependenceRate,
      doneCount,
      doneRate,
      hardDifficulty,
      contextStabilityScore,
      partialDoneRate,
    } = signals;
    const matches: RecommendationChoice[] = [];

    if (doneCount >= 5 && hardDifficulty && partialDoneRate >= 0.5) {
      matches.push({
        code: RecommendationCode.REDUCE_TARGET,
        reasonCode: ReasonCode.HIGH_DIFFICULTY,
        title: 'Зорилтот утгыг бага болго',
        message:
          'Та дадлаа зорилтот хэмжээнд хүргэхэд удаа дараа хүндрэлтэй байсан ч доод зорилтдоо хүрч байна. Зорилтоо хялбарчилж, тогтвортой гүйцэтгэлийг бий болго.',
        priority: Priority.HIGH,
        articleIds: ['reduce-friction', 'habit-small-steps'],
      });
    }

    if (doneCount >= 5 && hardDifficulty) {
      matches.push({
        code: RecommendationCode.SIMPLIFY_HABIT,
        reasonCode: ReasonCode.HIGH_DIFFICULTY,
        title: 'Дадлыг хялбарчил',
        message:
          'Та энэ дадлыг сүүлд удаа дараалан "хэцүү" эсвэл "маш хэцүү" гэж үнэлсэн байна. Алхамуудыг жижиглэж, хийхэд шаардагдах хүчин чармайлтыг бага болго.',
        priority: Priority.HIGH,
        articleIds: ['habit-small-steps', 'reduce-friction'],
      });
    }

    if (doneCount >= 5 && reminderDependenceRate >= 0.7) {
      matches.push({
        code: RecommendationCode.REVIEW_REMINDER_DEPENDENCE,
        reasonCode: ReasonCode.HIGH_REMINDER_DEPENDENCE,
        title: 'Сануулагчаас хамаарлаа бага болго',
        message:
          'Таны дадлын ихэнх нь сануулагчаар гүйцэтгэгдсэн байна. Сануулагчгүйгээр өөрийн санаачлагаар дадлаа хийх чадварыг хөгжүүл.',
        priority: Priority.MEDIUM,
        articleIds: ['reduce-reminder-dependence', 'build-consistency'],
      });
    }

    if (
      doneCount >= 5 &&
      contextStabilityScore !== null &&
      contextStabilityScore < CONTEXT_STABILITY_LOW_THRESHOLD
    ) {
      matches.push({
        code: RecommendationCode.ADJUST_CUE,
        reasonCode: ReasonCode.LOW_CONTEXT_STABILITY,
        title: 'Дадлын цаг, газрыг тогтворжуул',
        message:
          'Та энэ дадлыг өөр өөр цаг, газарт хийж байна. Тогтсон цаг, газар эсвэл тогтмол өмнөх үйлдэлтэй холбох нь дадлыг автомат болоход тусалдаг.',
        priority: Priority.MEDIUM,
        articleIds: ['fix-your-cues'],
      });
    }

    if (compositeScore !== null && compositeScore < 40 && doneRate < 0.4) {
      matches.push({
        code: RecommendationCode.INCREASE_SUPPORT,
        reasonCode: ReasonCode.LOW_CONSISTENCY,
        title: 'Дадлын дэмжлэгийг нэмэгдүүл',
        message:
          'Таны дадлын нийлмэл оноо болон гүйцэтгэлийн хувь аль аль нь бага байна. Дадлаа хийхэд орчноо зохион байгуулж, дэмжлэг нэмж өгөөрэй.',
        priority: Priority.MEDIUM,
        articleIds: ['build-consistency', 'reduce-friction'],
      });
    }

    if (doneCount >= 3 && (selfInitiatedRate < 0.4 || doneRate < 0.5)) {
      matches.push({
        code: RecommendationCode.BUILD_CONSISTENCY,
        reasonCode:
          selfInitiatedRate < 0.4
            ? ReasonCode.LOW_SELF_INITIATED_RATE
            : ReasonCode.LOW_CONSISTENCY,
        title: 'Дадлын тогтвортой байдлыг бий болго',
        message:
          'Дадлаа тогтмол давтаж хийх нь чухал. Дутуу өдрүүдийн дараа сэргэж, давтамжаа нэмэгдүүл.',
        priority: Priority.MEDIUM,
        articleIds: ['build-consistency', 'recover-after-missed-days'],
      });
    }

    if (doneCount >= 1 && doneCount < 3) {
      matches.push({
        code: RecommendationCode.BUILD_CONSISTENCY,
        reasonCode: ReasonCode.LOW_CONSISTENCY,
        title: 'Эхлэл тавьсан — дадлаа үргэлжлүүл!',
        message:
          'Дадлын эхэн үе хамгийн чухал. Ижил нөхцөлд тогтмол давтах тусам дадал аажмаар автомат болдог.',
        priority: Priority.LOW,
        articleIds: ['build-consistency'],
      });
    }

    if (doneCount === 7 || doneCount === 21 || doneCount === 66) {
      const message =
        doneCount === 66
          ? 'Та 66 удаа дадлаа хийсэн байна. Судалгаагаар дадал автомат болох хугацаа хүн бүрт харилцан адилгүй (Lally нарын судалгаанд дунджаар 66 хоног орчим) — тоо биш, хэр амархан, бодолгүй хийгдэж байгаа нь чухал. Үргэлжлүүл!'
          : doneCount === 21
            ? 'Та 21 удаа дадлаа хийсэн байна. Тогтмол давтаж байгаа нь сайн дохио — үргэлжлүүлээрэй.'
            : 'Та 7 удаа дадлаа хийсэн байна. Жишиг газарт хүрлээ — дадлаа үргэлжлүүлэн хийж байгаарай!';
      matches.push({
        code: RecommendationCode.CELEBRATE_CONSISTENCY,
        reasonCode: ReasonCode.MILESTONE_REACHED,
        title: `${doneCount} удаа гүйцэтгэсэн — тэмдэглэх цаг!`,
        message,
        priority: Priority.LOW,
        articleIds: ['maintain-strong-habits'],
      });
    }

    return matches;
  }

  /**
   * The primary recommendation: the highest-priority match whose code the
   * user has not dismissed recently, or null.
   */
  static choose(
    signals: RecommendationSignals,
    recentlyDismissed: ReadonlySet<RecommendationCode> = new Set(),
  ): RecommendationChoice | null {
    return (
      RecommendationRules.candidates(signals).find(
        (choice) => !recentlyDismissed.has(choice.code),
      ) ?? null
    );
  }
}
