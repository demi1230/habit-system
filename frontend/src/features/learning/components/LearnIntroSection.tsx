import { TYPOGRAPHY } from '@/shared/design';
import type { RecommendationItem } from '../model/recommendation.types';

// Maps a recommendation code to a short contextual intro line
const INTRO_BY_CODE: Partial<Record<string, string>> = {
  REVIEW_REMINDER_DEPENDENCE:
    'Та сүүлийн үед сануулгад тулгуурлаж байгаа тул cue болон бие даасан байдлыг бэхжүүлэх материалуудыг санал болгож байна.',
  ADJUST_CUE:
    'Таны дадлын дохио тогтворгүй байгаа тул зөв cue тохируулах материалуудыг санал болгов.',
  SIMPLIFY_HABIT:
    'Дадал арай хүнд санагдаж байгаа тул хялбарчлах болон жижиг алхамын материалуудыг санал болгож байна.',
  BUILD_CONSISTENCY:
    'Тогтвортой давталтын хувь арай бага байгаа тул тогтмол байдлыг бэхжүүлэх материалуудыг санал болгов.',
  REDUCE_TARGET:
    'Зорилтод хүрэхэд бэрхшээлтэй байгаа тул target болон хялбарчлалтын материалуудыг санал болгож байна.',
  CELEBRATE_CONSISTENCY:
    'Сайн ахиц гарч байна! Одоогийн хэмнэлийг хадгалахад туслах материалуудыг бэлдлээ.',
  INCREASE_SUPPORT:
    'Дадлыг бэхжүүлэх шатандаа байгаа тул дэмжлэгийн болон хялбарчлалын материалуудыг санал болгов.',
};

const DEFAULT_INTRO =
  'Таны сүүлийн ахицад үндэслэн дараах материалуудыг санал болгож байна.';

interface Props {
  recommendations: RecommendationItem[];
}

export function LearnIntroSection({ recommendations }: Props) {
  const topCode = recommendations[0]?.recommendationCode ?? '';
  const text = INTRO_BY_CODE[topCode] ?? DEFAULT_INTRO;

  return (
    <p style={{ ...TYPOGRAPHY.bodySm, lineHeight: 1.65 }} className="text-muted-foreground">
      {text}
    </p>
  );
}
