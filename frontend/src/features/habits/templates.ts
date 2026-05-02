import type { HabitFormInitialValues } from '@/pages/HabitFormPage';
import type { HabitColorKey } from '@/lib/habit-colors';
import type { Weekday } from '@/api/types';

export type HabitTemplateCategory =
  | 'health'
  | 'productivity'
  | 'learning'
  | 'mindfulness';

export interface HabitTemplateCategoryMeta {
  id: HabitTemplateCategory;
  label: string;
  /** Short line shown under the category heading in the picker. */
  description: string;
}

export const HABIT_TEMPLATE_CATEGORIES: HabitTemplateCategoryMeta[] = [
  {
    id: 'health',
    label: 'Эрүүл мэнд',
    description: 'Хичээл, ажил ихтэй өдөр ч эрүүл мэнддээ анхаарах жижиг дадлууд',
  },
  {
    id: 'productivity',
    label: 'Бүтээлч байдал',
    description: 'Цагаа зөв ашиглаж, өдөр тутмын ажлуудаа зохицуулах дадлууд',
  },
  {
    id: 'learning',
    label: 'Суралцах',
    description: 'Шалгалт, даалгавар, шинэ мэдлэгтэй холбоотой дадлууд',
  },
  {
    id: 'mindfulness',
    label: 'Сэтгэлгээ',
    description: 'Стрессээ бууруулж, анхаарал болон сэтгэлээ тогтворжуулах дадлууд',
  },
];

export interface HabitTemplate extends HabitFormInitialValues {
  id: string;
  category: HabitTemplateCategory;
  /** One-line summary shown on the template card. */
  tagline: string;
  /** Pre-filled color palette key for the habit. */
  colorId: HabitColorKey;
  /** Pre-filled emoji for the habit. */
  selectedEmoji: string;
}

const ALL_WEEKDAYS: Weekday[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

const WEEKDAYS_MON_FRI: Weekday[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

export const HABIT_TEMPLATES: HabitTemplate[] = [
  // ── Эрүүл мэнд ──────────────────────────────────────────────────────────
  {
    id: 'drink-water',
    category: 'health',
    tagline: 'Өдөрт 6 аяга ус уух',
    title: 'ус уух',
    selectedEmoji: '💧',
    colorId: 'sky',
    precedingRoutine: 'Өглөө сэрснийхээ',
    reason: 'биеэ сэргээж, хичээлдээ илүү төвлөрнө',
    benefits: ['Эрүүл мэнд дэмжих', 'Эрч хүч нэмэх'],
    steps: ['Усны саваа дүүргэх', 'Өглөө 1 аяга уух', 'Хичээлийн завсар бага багаар уух'],
    selectedDays: ALL_WEEKDAYS,
    habitType: 'measurable',
    targetNum: '6',
    targetUnit: 'аяга',
    reminderEnabled: false,
  },
  {
    id: 'walk-outside',
    category: 'health',
    tagline: 'Хичээл тарсны дараа 20 минут алхах',
    title: 'гадаа алхах',
    selectedEmoji: '🏃',
    colorId: 'mint',
    precedingRoutine: 'Хичээл тарсныхаа',
    reason: 'өдрийн суултаа тэнцвэржүүлж, толгойгоо сэргээнэ',
    benefits: ['Эрүүл мэнд дэмжих', 'Тайвшруулах'],
    steps: ['Чихэвчээ зүүхгүйгээр алхах', '20 минут тайван алхах'],
    selectedDays: ALL_WEEKDAYS,
    habitType: 'measurable',
    targetNum: '20',
    targetUnit: 'мин',
    reminderEnabled: false,
  },
  {
    id: 'stretch',
    category: 'health',
    tagline: 'Орой 7 минут нуруу, хүзүүгээ амраах',
    title: 'сунгалт хийх',
    selectedEmoji: '🧘',
    colorId: 'peach',
    precedingRoutine: 'Ширээний ард удаан суусныхаа',
    reason: 'нуруу, хүзүүний чилээгээ багасгана',
    benefits: ['Тайвшруулах', 'Эрч хүч нэмэх'],
    steps: ['Мөрөө эргүүлэх', 'Хүзүүгээ зөөлөн сунгах', 'Нуруугаа тэнийлгэх'],
    selectedDays: ALL_WEEKDAYS,
    habitType: 'measurable',
    targetNum: '7',
    targetUnit: 'мин',
    reminderEnabled: false,
  },
  {
    id: 'early-sleep',
    category: 'health',
    tagline: 'Унтахаасаа өмнө утсаа хол тавих',
    title: 'эрт унтах',
    selectedEmoji: '😴',
    colorId: 'lavender',
    precedingRoutine: 'Маргаашийн цүнхээ бэлдсэнийхээ',
    reason: 'өглөө яарахгүй сэрж, хичээлдээ сэргэг очно',
    benefits: ['Тайвшруулах', 'Эрч хүч нэмэх'],
    steps: ['Утсаа хол тавих', 'Орондоо орох'],
    selectedDays: ALL_WEEKDAYS,
    habitType: 'binary',
    targetNum: '1',
    targetUnit: 'удаа',
    reminderEnabled: false,
  },

  // ── Бүтээлч байдал ──────────────────────────────────────────────────────
  {
    id: 'morning-plan',
    category: 'productivity',
    tagline: 'Өнөөдрийн 3 гол ажлаа бичих',
    title: 'өдрийн 3 гол ажлаа бичих',
    selectedEmoji: '✍️',
    colorId: 'yellow',
    precedingRoutine: 'Өглөөний цайгаа уусныхаа',
    reason: 'юунаас эхлэхээ мэдэж, цаг алдалгүй хөдөлнө',
    benefits: ['Бүтээмж нэмэх', 'Анхаарал төвлөрүүлэх'],
    steps: ['Тэмдэглэлээ нээх', 'Өнөөдрийн 3 гол ажлаа бичих', 'Хамгийн эхний ажлаа сонгох'],
    selectedDays: WEEKDAYS_MON_FRI,
    habitType: 'binary',
    targetNum: '1',
    targetUnit: 'удаа',
    reminderEnabled: false,
  },
  {
    id: 'deep-work',
    category: 'productivity',
    tagline: 'Утасгүй 25 минут төвлөрөх',
    title: 'төвлөрөн хичээл хийх',
    selectedEmoji: '⚡',
    colorId: 'lavender',
    precedingRoutine: 'Ширээнийхээ ард суусныхаа',
    reason: 'анхаарлаа сарниулалгүйгээр даалгавраа урагшлуулна',
    benefits: ['Бүтээмж нэмэх', 'Анхаарал төвлөрүүлэх'],
    steps: ['Утсаа хол тавих', '25 минутын timer тавих', 'Нэг л даалгавар дээр ажиллах'],
    selectedDays: WEEKDAYS_MON_FRI,
    habitType: 'measurable',
    targetNum: '25',
    targetUnit: 'мин',
    reminderEnabled: false,
  },
  {
    id: 'tidy-desk',
    category: 'productivity',
    tagline: 'Хичээлээ дуусгаад ширээгээ цэгцлэх',
    title: 'ширээгээ цэгцлэх',
    selectedEmoji: '🧹',
    colorId: 'pink',
    precedingRoutine: 'Хичээлээ хийж дуусгасныхаа',
    reason: 'маргааш цэвэрхэн орчинд сэтгэл амар эхэлнэ',
    benefits: ['Анхаарал төвлөрүүлэх', 'Тайвшруулах'],
    steps: ['Дэвтэр, номоо хураах', 'Хэрэггүй цаасаа ялгах', 'Ширээгээ арчих'],
    selectedDays: WEEKDAYS_MON_FRI,
    habitType: 'binary',
    targetNum: '1',
    targetUnit: 'удаа',
    reminderEnabled: false,
  },

  // ── Суралцах ─────────────────────────────────────────────────────────────
  {
    id: 'read-pages',
    category: 'learning',
    tagline: 'Өдөрт 10 хуудас ном эсвэл хичээлийн материал унших',
    title: 'ном унших',
    selectedEmoji: '📖',
    colorId: 'peach',
    precedingRoutine: 'Орондоо орсныхоо',
    reason: 'унших дадлаа хадгалж, ойлгох чадвараа сайжруулна',
    benefits: ['Анхаарал төвлөрүүлэх', 'Тайвшруулах'],
    steps: ['Унших зүйлээ бэлдэх', '10 хуудас унших', 'Гол санааг нэг өгүүлбэрээр тэмдэглэх'],
    selectedDays: ALL_WEEKDAYS,
    habitType: 'measurable',
    targetNum: '10',
    targetUnit: 'хуудас',
    reminderEnabled: false,
  },
  {
    id: 'new-words',
    category: 'learning',
    tagline: 'Өдөрт 5 англи эсвэл мэргэжлийн шинэ үг цээжлэх',
    title: 'шинэ үг цээжлэх',
    selectedEmoji: '🧠',
    colorId: 'sky',
    precedingRoutine: 'Автобусанд суусныхаа',
    reason: 'сул цагаа ашиглаж, үгийн сангаа тогтмол нэмэгдүүлнэ',
    benefits: ['Анхаарал төвлөрүүлэх', 'Бүтээмж нэмэх'],
    steps: ['Өчигдрийн үгээ давтах', '5 шинэ үг бичих', 'Жишээ өгүүлбэр зохиох'],
    selectedDays: ALL_WEEKDAYS,
    habitType: 'measurable',
    targetNum: '5',
    targetUnit: 'удаа',
    reminderEnabled: false,
  },
  {
    id: 'course-lesson',
    category: 'learning',
    tagline: 'Хичээлээ тараад 15 минут давтах',
    title: 'хичээлээ давтах',
    selectedEmoji: '📚',
    colorId: 'mint',
    precedingRoutine: 'Гэртээ ирснийхээ',
    reason: 'өнөөдрийн сурсан зүйлээ мартахгүй бататгана',
    benefits: ['Бүтээмж нэмэх', 'Анхаарал төвлөрүүлэх'],
    steps: ['Өнөөдрийн тэмдэглэлээ харах', 'Гол 3 санааг давтах', 'Ойлгоогүй зүйлээ тэмдэглэх'],
    selectedDays: WEEKDAYS_MON_FRI,
    habitType: 'measurable',
    targetNum: '15',
    targetUnit: 'мин',
    reminderEnabled: false,
  },

  {
    id: 'homework-first-step',
    category: 'learning',
    tagline: 'Даалгаврынхаа эхний жижиг алхмыг хийх',
    title: 'даалгавраа эхлүүлэх',
    selectedEmoji: '✅',
    colorId: 'yellow',
    precedingRoutine: 'Цүнхээ тавьсныхаа',
    reason: 'хойшлуулалтаа багасгаж, даалгавраа амархан эхлүүлнэ',
    benefits: ['Бүтээмж нэмэх', 'Анхаарал төвлөрүүлэх'],
    steps: ['Даалгаврын жагсаалтаа харах', 'Хамгийн жижиг алхмыг сонгох', '10 минут эхлээд хийх'],
    selectedDays: WEEKDAYS_MON_FRI,
    habitType: 'measurable',
    targetNum: '10',
    targetUnit: 'мин',
    reminderEnabled: false,
  },

  // ── Сэтгэлгээ ────────────────────────────────────────────────────────────
  {
    id: 'meditation',
    category: 'mindfulness',
    tagline: 'Хичээл эхлэхээс өмнө 3 минут амьсгалаа ажиглах',
    title: 'амьсгалаа ажиглах',
    selectedEmoji: '🧘',
    colorId: 'lavender',
    precedingRoutine: 'Ширээнийхээ ард суусныхаа',
    reason: 'сандралаа багасгаж, анхаарлаа нэг цэгт төвлөрүүлнэ',
    benefits: ['Тайвшруулах', 'Анхаарал төвлөрүүлэх'],
    steps: ['Нуруугаа тэгшлэх', 'Нүдээ аних', 'Амьсгалаа 3 минут ажиглах'],
    selectedDays: ALL_WEEKDAYS,
    habitType: 'measurable',
    targetNum: '3',
    targetUnit: 'мин',
    reminderEnabled: false,
  },
  {
    id: 'gratitude',
    category: 'mindfulness',
    tagline: 'Өдрийн төгсгөлд тохиолдсон 3 сайхан зүйл бичих',
    title: 'талархлын тэмдэглэл бичих',
    selectedEmoji: '❤️',
    colorId: 'pink',
    precedingRoutine: 'Унтах бэлтгэлээ хийснийхээ',
    reason: 'өдрөөсөө сайн талыг олж харж сурна',
    benefits: ['Тайвшруулах'],
    steps: ['Тэмдэглэлээ нээх', 'Өнөөдрийн 3 сайн зүйлээ бичих', 'Нэгийг нь яагаад сайн байсныг тэмдэглэх'],
    selectedDays: ALL_WEEKDAYS,
    habitType: 'measurable',
    targetNum: '3',
    targetUnit: 'хэсэг',
    reminderEnabled: false,
  },
  {
    id: 'screen-free',
    category: 'mindfulness',
    tagline: 'Унтахын өмнө 30 минут утасгүй байх',
    title: 'дэлгэцгүй цаг гаргах',
    selectedEmoji: '🌿',
    colorId: 'mint',
    precedingRoutine: 'Орой шүдээ угаасныхаа',
    reason: 'сэтгэлээ тайвшруулж, нойроо илүү чанартай болгоно',
    benefits: ['Тайвшруулах', 'Анхаарал төвлөрүүлэх'],
    steps: ['Утсаа цэнэглэгч дээр хол тавих', 'Дэлгэцгүй 30 минут өнгөрөөх', 'Утастай холбоогүй өөр ажилд төвлөрөх'],
    selectedDays: ALL_WEEKDAYS,
    habitType: 'measurable',
    targetNum: '30',
    targetUnit: 'мин',
    reminderEnabled: false,
  },
  {
    id: 'emotion-check-in',
    category: 'mindfulness',
    tagline: 'Өдөрт нэг удаа өөрийн мэдрэмжээ нэрлэх',
    title: 'мэдрэмжээ тэмдэглэх',
    selectedEmoji: '🌿',
    colorId: 'sky',
    precedingRoutine: 'Орой гэрийн даалгавраа дуусгасныхаа',
    reason: 'өөрийгөө илүү сайн ойлгож, стрессээ эрт анзаарна',
    benefits: ['Тайвшруулах', 'Анхаарал төвлөрүүлэх'],
    steps: ['Өнөөдөр юу мэдэрснээ нэрлэх', 'Яагаад тэгж мэдэрснээ нэг өгүүлбэрээр бичих'],
    selectedDays: ALL_WEEKDAYS,
    habitType: 'binary',
    targetNum: '1',
    targetUnit: 'удаа',
    reminderEnabled: false,
  },
];

/** Group templates by category in the same order as HABIT_TEMPLATE_CATEGORIES. */
export function groupTemplatesByCategory(): Array<{
  meta: HabitTemplateCategoryMeta;
  templates: HabitTemplate[];
}> {
  return HABIT_TEMPLATE_CATEGORIES.map((meta) => ({
    meta,
    templates: HABIT_TEMPLATES.filter((t) => t.category === meta.id),
  }));
}
