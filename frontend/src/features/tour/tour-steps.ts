import type { Step } from 'react-joyride';

// ── Dashboard (/dashboard) ───────────────────────────────────────────────────

const DASHBOARD_STEPS: Step[] = [
  {
    target: '#tour-add-btn',
    title: 'Шинэ дадал нэмэх',
    content: 'Энэ товч дарж шинэ дадал үүсгэх эсвэл бэлэн загвараас сонгоорой.',
    placement: 'bottom',
  },
  {
    target: '#tour-week-strip',
    title: 'Огноо сонгох',
    content: 'Долоо хоногийн шилжүүлэгч ашиглан өнгөрсөн буюу ирэх өдрүүдийн дадлуудаа харна уу.',
    placement: 'bottom',
  },
  {
    target: '#tour-habit-list',
    title: 'Өдрийн дадлууд',
    content: '+ товч дарж дадлаа бүртгэнэ. Бүртгэсний дараа картаа зүүн тийш гулсуулж засах эсвэл буцаах боломжтой.',
    placement: 'top',
  },
];

// ── Create habit (/create/new) ───────────────────────────────────────────────

const CREATE_STEPS: Step[] = [
  {
    target: '#tour-form-sentence',
    title: 'Дадлаа тодорхойл',
    content: 'Юу хийсний дараа юу хийх, ингэснээрээ танд ямар үр дүн авчрах зэргийг өгүүлбэр хэлбэрээр оруулаарай. Энэ хэсэг дадлын үндэс суурь болно.',
    placement: 'bottom',
  },
  {
    target: '#tour-form-appearance',
    title: 'Харагдац',
    content: 'Дадалдаа тохирох emoji болон өнгийг сонгоно.',
    placement: 'bottom',
  },
  {
    target: '#tour-form-measurement',
    title: 'Хэмжилт',
    content: '"Хийсэн/Хийгээгүй" - нэг товшилтоор бүртгэнэ. "Хэмжигдэхүйц" - тоо оруулж бүртгэнэ (ж: 30 минут, 10 хуудас).',
    placement: 'bottom',
  },
  {
    target: '#tour-form-schedule',
    title: 'Хийх өдрүүд',
    content: 'Долоо хоногийн аль өдрүүдэд хийхийг тохируулна. "Бүгд" эсвэл "Ажлын" дарж хурдан сонгох боломжтой.',
    placement: 'bottom',
  },
  {
    target: '#tour-form-benefits',
    title: 'Ашиг тус (заавал биш)',
    content: 'Энэ дадал ямар ашиг тустай вэ? Жишээ санал болгосон жагсаалтаас сонгох эсвэл өөрийнхөө ашиг тусыг нэмнэ. Дадал тодорхой байх тусам хийхэд амар болно',
    placement: 'top',
  },
  {
    target: '#tour-form-steps',
    title: 'Жижиг алхмууд (заавал биш)',
    content: 'Дадлаа 2–5 жижиг алхамд хуваана. Дасгал хийх -> Гутлаа өмсөх гэх мэт жижиг алхам нь эхлэхийг хялбар болгоно.',
    placement: 'top',
  },
  {
    target: '#tour-form-reminder',
    title: 'Сануулга',
    content: 'Идэвхжүүлбэл тодорхой цагт эсвэл байршилд очих үед мэдэгдэл ирнэ. Эхний удаа браузер зөвшөөрөл асуух тул зөвшөөрөөрэй.',
    placement: 'top',
  },
];

// ── Analytics (/analytics) ───────────────────────────────────────────────────

const ANALYTICS_STEPS: Step[] = [
  {
    target: '#tour-analytics-selector',
    title: 'Дадлаа сонгох',
    content: 'Дугуй зургуудаас дадлаа сонгон тухайн дадлын дэлгэрэнгүй статистикийг харна уу. "Бүгд" дарвал нийт дадлуудын тойм харагдана.',
    placement: 'bottom',
  },
  {
    target: '#tour-analytics-strength',
    title: 'Дадлын хүч',
    content: 'Тууштай байдал, контекст тогтворжилт, SRBAI автоматжилтыг нэгтгэсэн 0–100 оноо. 70+ бол дадал бэхжиж лаг дадалтай болсоон гэсэн үг ^^.',
    placement: 'bottom',
  },
  {
    target: '#tour-analytics-srbai',
    title: 'Автоматжилтын үнэлгээ (SRBAI)',
    content: 'Дадлын автоматжилтын үнэлгээ өгөх ба үндсэн 4-н асуулт асууж автоматжилтыг тогтоох болно. Үнэлгээ өгөх товч дээр даран үнэлгээг өгнө. Долоо хоногт 1 удаа үнэлгээ өгвөл сайн жүү',
    placement: 'top',
  },
  {
    target: '#tour-analytics-recommendations',
    title: 'Зөвлөмж',
    content: 'Дадлын өгөгдөлд тулгуурлан нийтлэл, зөвлөгөөг санал болгоно. Дэлгэрэнгүй судлах дээр дарж дэлгэрүүлэн үзээрэй.',
    placement: 'top',
  },
];

// ── Route config map ─────────────────────────────────────────────────────────

export interface PageTourConfig {
  steps: Step[];
  storageKey: string;
  delay: number;
  autoStart?: boolean;
}

export const PAGE_TOUR_CONFIG: Record<string, PageTourConfig> = {
  '/dashboard': {
    steps: DASHBOARD_STEPS,
    storageKey: 'tour_completed',
    delay: 900,
  },
  '/create/new': {
    steps: CREATE_STEPS,
    storageKey: 'tour_completed_create',
    delay: 700,
  },
  '/analytics': {
    steps: ANALYTICS_STEPS,
    storageKey: 'tour_completed_analytics',
    delay: 700,
    autoStart: false,
  },
};
