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
    content: 'Өдөр сонгож тухайн өдрийн дадлуудаа харна.',
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
  { target: '#tour-form-sentence', title: 'Юу хийх вэ?', content: 'Жишээ: өглөө босоод нэг аяга ус уух.', placement: 'bottom' },
  { target: '#tour-form-measurement', title: 'Хэрхэн бүртгэх вэ?', content: 'Нэг товшилтоор эсвэл тоо оруулж бүртгэнэ.', placement: 'bottom' },
  { target: '#tour-form-schedule', title: 'Хэзээ хийх вэ?', content: 'Дадлаа хийх өдрүүдийг сонгоорой.', placement: 'bottom' },
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
    content: 'Тогтмол хийж байгаа байдлыг 0–100 оноогоор харуулна.',
    placement: 'bottom',
  },
  {
    target: '#tour-analytics-srbai',
    title: 'Автоматжилтын үнэлгээ (SRBAI)',
    content: 'Дөрвөн асуултад хариулж дадал хэр автомат болсныг үнэлээрэй.',
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
    autoStart: false,
  },
  '/create/new': {
    steps: CREATE_STEPS,
    storageKey: 'tour_completed_create',
    delay: 700,
    autoStart: false,
  },
  '/analytics': {
    steps: ANALYTICS_STEPS,
    storageKey: 'tour_completed_analytics',
    delay: 700,
    autoStart: false,
  },
};
