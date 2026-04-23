/**
 * Centralized recommendation copy map.
 *
 * All user-facing Mongolian strings for recommendation cards live here.
 * Components must NOT hardcode recommendation text inline — import
 * `getRecommendationCopy` and derive copy from `recommendationCode`.
 */

export interface RecommendationCopy {
  title: string;
  message: string;
  whyLabel: string;
  whyText: string;
  ctaLabel: string;
}

export type RecommendationCode =
  | 'REDUCE_TARGET'
  | 'SIMPLIFY_HABIT'
  | 'REVIEW_REMINDER_DEPENDENCE'
  | 'ADJUST_CUE'
  | 'INCREASE_SUPPORT'
  | 'BUILD_CONSISTENCY'
  | 'CELEBRATE_CONSISTENCY';

const RECOMMENDATION_COPY_MAP: Record<RecommendationCode, RecommendationCopy> = {
  REDUCE_TARGET: {
    title: 'Зорилтоо бага зэрэг багасгая',
    message:
      'Та энэ дадлыг тогтмол эхлүүлж чаддаг ч одоогийн зорилтот хэмжээндээ хүрэхэд хэт ачаалалтай санагдаж байна. Эхний ээлжид зорилтоо арай бодитой түвшинд бууруулбал тогтвортой үргэлжлүүлэхэд илүү амар болно.',
    whyLabel: 'Яагаад?',
    whyText:
      'Сүүлийн үед та minimum target-дээ хүрч байгаа ч target value-дээ тогтмол хүрэхгүй, мөн энэ дадлыг хэцүү гэж үнэлсэн байна.',
    ctaLabel: 'Дэлгэрүүлэн судлах',
  },

  SIMPLIFY_HABIT: {
    title: 'Дадлаа илүү хялбар болгоё',
    message:
      'Одоогийн хэлбэрээрээ энэ дадал танд хэт хүнд санагдаж байна. Дадлыг жижиг алхамд хувааж, эхлэх босгыг нь багасгавал тогтмол хийх боломж нэмэгдэнэ.',
    whyLabel: 'Яагаад?',
    whyText: 'Сүүлийн гүйцэтгэлүүд дээр энэ дадал давтагдан хэцүү гэж үнэлэгдсэн байна.',
    ctaLabel: 'Дэлгэрүүлэн судлах',
  },

  REVIEW_REMINDER_DEPENDENCE: {
    title: 'Сануулгаас бага хамааралтай болъё',
    message:
      'Та ихэвчлэн сануулгын дараа энэ дадлаа хийж байна. Одоо cue-гээ илүү тодорхой болгож, өөрөө санаачлан эхлүүлэх хэв маягийг аажмаар хөгжүүлэх хэрэгтэй.',
    whyLabel: 'Яагаад?',
    whyText: 'Сүүлийн гүйцэтгэлүүдийн ихэнх нь сануулгад тулгуурласан байна.',
    ctaLabel: 'Дэлгэрүүлэн судлах',
  },

  ADJUST_CUE: {
    title: 'Өдөөгч нөхцлөө сайжруулъя',
    message:
      'Энэ дадлыг хийх цаг, байршил, өмнөх үйлдэл тань тогтворгүй байна. Илүү тогтмол cue тохируулбал дадлыг эхлүүлэх нь илүү амар болно.',
    whyLabel: 'Яагаад?',
    whyText:
      'Гүйцэтгэлийн нөхцөлүүд тогтворгүй байгаа нь дадлыг автоматаар эхлүүлэхэд саад болж байна.',
    ctaLabel: 'Дэлгэрүүлэн судлах',
  },

  INCREASE_SUPPORT: {
    title: 'Одоохондоо илүү дэмжлэг хэрэгтэй байна',
    message:
      'Энэ дадал хараахан тогтвортой болоогүй байна. Одоогоор сануулга, хялбаршуулах дэмжлэг, бага алхамтай төлөвлөгөөгөө хадгалбал илүү үр дүнтэй.',
    whyLabel: 'Яагаад?',
    whyText: 'Гүйцэтгэлийн түвшин болон дадлын хүчний үзүүлэлтүүд сул байна.',
    ctaLabel: 'Дэлгэрүүлэн судлах',
  },

  BUILD_CONSISTENCY: {
    title: 'Тогтмол давталтаа бэхжүүлье',
    message:
      'Та энэ дадлыг заримдаа хийж байгаа ч тогтмол хэвшил болоход арай эрт байна. Өдөр бүрийн тогтвортой давталтад анхаарвал бэхжилт хурдан өснө.',
    whyLabel: 'Яагаад?',
    whyText:
      'Өөрөө санаачлан хийх хувь бага эсвэл нийт гүйцэтгэлийн түвшин тогтворгүй байна.',
    ctaLabel: 'Дэлгэрүүлэн судлах',
  },

  CELEBRATE_CONSISTENCY: {
    title: 'Сайн байна, ахиц гарч байна',
    message:
      'Та энэ дадлыг тогтмол давтаж эхэлжээ. Одоогийн хэмнэлээ хадгалж чадвал дадал улам тогтвортой болно.',
    whyLabel: 'Яагаад?',
    whyText:
      'Та чухал үе шатны тоонд хүрсэн байна. Энэ нь тогтворжилт өсөж байгаагийн эерэг дохио юм.',
    ctaLabel: 'Дэлгэрүүлэн судлах',
  },
};

const FALLBACK_COPY: RecommendationCopy = {
  title: 'Зөвлөмж',
  message: 'Таны одоогийн ахицад үндэслэн энэ зөвлөмжийг санал болгож байна.',
  whyLabel: 'Яагаад?',
  whyText:
    'Систем таны сүүлийн үеийн гүйцэтгэлийн мэдээлэлд үндэслэн энэ зөвлөмжийг гаргасан.',
  ctaLabel: 'Дэлгэрүүлэн судлах',
};

export function getRecommendationCopy(code: string): RecommendationCopy {
  return RECOMMENDATION_COPY_MAP[code as RecommendationCode] ?? FALLBACK_COPY;
}
