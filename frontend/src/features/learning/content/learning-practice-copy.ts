import type { RecommendationCode } from '../model/recommendation.types';

export interface PracticeTip {
  action: string;
  detail: string;
}

export const PRACTICE_TODAY_MAP: Partial<Record<RecommendationCode, PracticeTip>> = {
  SIMPLIFY_HABIT: {
    action: 'Өнөөдөр minimum target-аа арай бууруулж туршаад үз.',
    detail: 'Амжилтын босгыг бага болгоход ичих хэрэггүй — энэ нь ухаалаг алхам.',
  },
  ADJUST_CUE: {
    action: 'Нэг cue-гээ өнөөдөр илүү тодорхой болгоод үз.',
    detail: 'Цаг, байршил, өмнөх үйлдэл — аль нэгийг нь бэхжүүлэхэд хангалттай.',
  },
  REVIEW_REMINDER_DEPENDENCE: {
    action: 'Нэг удаа сануулгагүйгээр өөрөө эхлүүлж үз.',
    detail: 'Амжилттай хийвэл тэмдэглэж аваарай — энэ чухал алхам.',
  },
  BUILD_CONSISTENCY: {
    action: 'Хийхийн өмнө 10 секунд зориулж эхлэлийн дохиогоо санаарай.',
    detail: 'Сануулагч тавих нь биш, дохионы мэдрэмжийг хөгжүүлэх нь чухал.',
  },
  REDUCE_TARGET: {
    action: 'Энэ долоо хоногт target-аа нэг алхам багасгаад туршаад үз.',
    detail: 'Жижиг зорилт — илүү тогтмол хийх боломж.',
  },
  INCREASE_SUPPORT: {
    action: 'Дадлаа хийх орчноо нэг дэлгэрэнгүй зүйлээр хялбарчилж үз.',
    detail: 'Friction-ийг бага багаар арилгах нь дадлыг бэхжүүлнэ.',
  },
  CELEBRATE_CONSISTENCY: {
    action: 'Дадлаа хийсний дараа 5 секунд ялалтаа мэдэрч аваарай.',
    detail: 'Урамшил бол хамгийн хүчтэй бэхжүүлэгч.',
  },
};

const DEFAULT_TIP: PracticeTip = {
  action: 'Өнөөдөр нэг дадлаа тогтмол хийхэд анхаарлаа хандуулаарай.',
  detail: 'Жижиг, тогтмол алхам — урт хугацааны амжилтын үндэс.',
};

export function getPracticeTip(code: string): PracticeTip {
  return PRACTICE_TODAY_MAP[code as RecommendationCode] ?? DEFAULT_TIP;
}
