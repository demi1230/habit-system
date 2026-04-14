import { useSyncExternalStore } from 'react';

export type Lang = 'en' | 'mn';

let currentLang: Lang = (typeof localStorage !== 'undefined' && localStorage.getItem('bloom-lang') as Lang) || 'mn';
let langListeners = new Set<() => void>();

function emitLangChange() {
  for (const l of langListeners) l();
}

export function setLang(lang: Lang) {
  currentLang = lang;
  if (typeof localStorage !== 'undefined') localStorage.setItem('bloom-lang', lang);
  emitLangChange();
}

export function getLang(): Lang {
  return currentLang;
}

export function useLang(): Lang {
  return useSyncExternalStore(
    (cb) => { langListeners.add(cb); return () => langListeners.delete(cb); },
    () => currentLang,
  );
}

const translations: Record<string, Record<Lang, string>> = {
  'common.back': { en: 'Back', mn: 'Буцах' },
  'common.next': { en: 'Next', mn: 'Дараах' },
  'common.continue': { en: 'Continue', mn: 'Үргэлжлүүлэх' },
  'common.cancel': { en: 'Cancel', mn: 'Цуцлах' },
  'common.save': { en: 'Save', mn: 'Хадгалах' },
  'common.delete': { en: 'Delete', mn: 'Устгах' },
  'common.skip': { en: 'Skip', mn: 'Алгасах' },
  'common.close': { en: 'Close', mn: 'Хаах' },
  'common.done': { en: 'Done', mn: 'Дууссан' },
  'common.active': { en: 'Active', mn: 'Идэвхтэй' },
  'common.off': { en: 'Off', mn: 'Идэвхгүй' },
  'common.today': { en: 'Today', mn: 'Өнөөдөр' },

  'welcome.tagline': { en: 'Build habits that grow with you — gently, flexibly, and at your own pace.', mn: 'Дадлаа өөрийнхөөрөө, зөөлөн, уян хатнаар бий болго.' },
  'welcome.motto': { en: 'Progress over perfection', mn: 'Төгс биш ч ахиц дэвшил' },
  'welcome.getStarted': { en: 'Get Started', mn: 'Эхлэх' },
  'welcome.signIn': { en: 'Sign In', mn: 'Нэвтрэх' },

  'onboarding.step1.title': { en: 'Build habits gently', mn: 'Дадлыг зөөлөн бий болго' },
  'onboarding.step1.desc': { en: 'No guilt, no pressure. We focus on flexible progress — not perfection.', mn: 'Гэм буруугүй, дарамтгүй. Уян хатан ахиц дэвшилд анхаарна — төгс биш.' },
  'onboarding.step2.title': { en: 'Smart reminders', mn: 'Ухаалаг сануулга' },
  'onboarding.step2.desc': { en: "Get reminded at the right time, in the right context.", mn: 'Зөв цагт, зөв нөхцөлд сануулга авна.' },
  'onboarding.step3.title': { en: 'Reflect & grow', mn: 'Эргэцүүлэл ба өсөлт' },
  'onboarding.step3.desc': { en: 'After completing a habit, take a moment to notice how you feel.', mn: 'Дадал гүйцэтгэсний дараа өөрийгөө хэрхэн мэдрэж байгааг анзаар.' },
  'onboarding.step4.title': { en: 'Choose your goals', mn: 'Зорилгоо сонго' },
  'onboarding.step4.desc': { en: 'Select the goal tags that matter to you.', mn: 'Танд чухал зорилгын шошгуудыг сонго.' },

  'cat.health': { en: 'Health', mn: 'Эрүүл мэнд' },
  'cat.study': { en: 'Study', mn: 'Суралцах' },
  'cat.fitness': { en: 'Fitness', mn: 'Фитнес' },
  'cat.mindfulness': { en: 'Mindfulness', mn: 'Сэтгэл зүй' },
  'cat.productivity': { en: 'Productivity', mn: 'Бүтээмж' },
  'cat.creativity': { en: 'Creativity', mn: 'Бүтээлч байдал' },
  'cat.social': { en: 'Social', mn: 'Нийгэм' },
  'cat.finance': { en: 'Finance', mn: 'Санхүү' },

  'auth.welcomeBack': { en: 'Welcome back', mn: 'Тавтай морил' },
  'auth.createAccount': { en: 'Create account', mn: 'Бүртгүүлэх' },
  'auth.loginSub': { en: "Let's continue building your habits", mn: 'Дадлаа бий болгож үргэлжлүүлье' },
  'auth.signupSub': { en: 'Start your habit journey today', mn: 'Дадлын аялалаа өнөөдөр эхлүүл' },
  'auth.fullName': { en: 'Full Name', mn: 'Бүтэн нэр' },
  'auth.email': { en: 'Email', mn: 'Имэйл' },
  'auth.password': { en: 'Password', mn: 'Нууц үг' },
  'auth.yourName': { en: 'Your name', mn: 'Таны нэр' },
  'auth.forgotPassword': { en: 'Forgot password?', mn: 'Нууц үг мартсан?' },
  'auth.signInBtn': { en: 'Sign In', mn: 'Нэвтрэх' },
  'auth.createAccountBtn': { en: 'Create Account', mn: 'Бүртгүүлэх' },
  'auth.noAccount': { en: "Don't have an account?", mn: 'Бүртгэл байхгүй юу?' },
  'auth.signUp': { en: 'Sign up', mn: 'Бүртгүүлэх' },
  'auth.hasAccount': { en: 'Already have an account?', mn: 'Бүртгэлтэй юу?' },
  'auth.signInLink': { en: 'Sign in', mn: 'Нэвтрэх' },

  'dash.goodMorning': { en: 'Good morning', mn: 'Өглөөний мэнд' },
  'dash.goodAfternoon': { en: 'Good afternoon', mn: 'Өдрийн мэнд' },
  'dash.goodEvening': { en: 'Good evening', mn: 'Оройн мэнд' },
  'dash.todaysHabits': { en: "Today's Habits", mn: 'Өнөөдрийн дадлууд' },

  'checkin.howDidItGo': { en: 'How did it go today?', mn: 'Өнөөдөр яаж боллоо?' },
  'checkin.doneForToday': { en: 'Done for today', mn: 'Өнөөдөр хийсэн' },
  'checkin.partialStillCounts': { en: 'Partial — still counts', mn: 'Хэсэгчлэн — тооцогдоно' },
  'checkin.skipToday': { en: 'Skip today — no judgment', mn: 'Өнөөдөр алгасах — буруушаахгүй' },
  'checkin.logValue': { en: 'Log this value', mn: 'Утга бүртгэх' },

  'analytics.title': { en: 'Progress', mn: 'Ахиц дэвшил' },
  'analytics.subtitle': { en: "You're doing better than you think", mn: 'Та бодсоноос илүү сайн хийж байна' },
  'analytics.avgCompletion': { en: 'Avg Completion', mn: 'Дундаж гүйцэтгэл' },
  'analytics.bestStreak': { en: 'Best Streak', mn: 'Хамгийн урт цуваа' },
  'analytics.days': { en: 'days', mn: 'өдөр' },

  'detail.streak': { en: 'Streak', mn: 'Цуваа' },
  'detail.strength': { en: 'Strength', mn: 'Хүч' },
  'detail.completion': { en: 'Completion', mn: 'Гүйцэтгэл' },
  'detail.whyMatters': { en: 'Why this matters', mn: 'Яагаад чухал' },
  'detail.schedule': { en: 'Schedule', mn: 'Хуваарь' },
  'detail.contextCues': { en: 'Context & Cues', mn: 'Нөхцөл ба дохио' },
  'detail.recentActivity': { en: 'Recent Activity', mn: 'Сүүлийн идэвхжил' },
  'detail.habitStrength': { en: 'Habit Strength', mn: 'Дадлын хүч' },
  'detail.archiveHabit': { en: 'Archive this habit?', mn: 'Энэ дадлыг архивлах уу?' },
  'detail.yesArchive': { en: 'Yes, archive it', mn: 'Тийм, архивлах' },
  'detail.keepActive': { en: 'Keep it active', mn: 'Идэвхтэй хэвээр' },
  'detail.days': { en: 'days', mn: 'өдөр' },

  'reminders.title': { en: 'Reminders', mn: 'Сануулгууд' },
  'reminders.quietHours': { en: 'Quiet Hours', mn: 'Чимээгүй цаг' },
  'reminders.quietDesc': { en: 'No reminders 11 PM - 7 AM', mn: 'Шөнийн 11 - Өглөөний 7 хүртэл сануулга байхгүй' },
  'reminders.yourReminders': { en: 'Your Reminders', mn: 'Таны сануулгууд' },
  'reminders.snooze': { en: 'Snooze Options', mn: 'Хойшлуулах сонголтууд' },

  'archive.title': { en: 'Archive', mn: 'Архив' },
  'archive.subtitle': { en: "Habits you've stabilized or paused", mn: 'Тогтворжсон эсвэл түр зогсоосон дадлууд' },
  'archive.noHabits': { en: 'No archived habits yet', mn: 'Архивлагдсан дадал байхгүй' },

  'profile.title': { en: 'Profile', mn: 'Профайл' },
  'profile.signOut': { en: 'Sign Out', mn: 'Гарах' },
  'profile.theme': { en: 'Theme & Appearance', mn: 'Загвар ба гадаад төрх' },
  'profile.language': { en: 'Language', mn: 'Хэл' },

  'create.title': { en: 'Create Habit', mn: 'Дадал үүсгэх' },
  'create.edit': { en: 'Edit Habit', mn: 'Дадал засах' },
  'create.habitName': { en: 'Habit Name', mn: 'Дадлын нэр' },
  'create.habitNamePh': { en: 'e.g., Morning meditation', mn: 'жнь., Өглөөний бясалгал' },
  'create.descOptional': { en: 'Description (optional)', mn: 'Тайлбар (заавал биш)' },
  'create.descPh': { en: 'What does this habit look like for you?', mn: 'Энэ дадал танд ямар харагдах вэ?' },
  'create.habitType': { en: 'How will you track this?', mn: 'Үүнийг хэрхэн хянах вэ?' },
  'create.yesNo': { en: 'Done / Not done', mn: 'Хийсэн / Хийгээгүй' },
  'create.measurable': { en: 'Track by number', mn: 'Тоогоор хянах' },
  'create.unit': { en: 'What are you counting?', mn: 'Юу тоолох вэ?' },
  'create.target': { en: 'Daily goal', mn: 'Өдрийн зорилт' },
  'create.minimum': { en: 'Minimum to count', mn: 'Тооцогдох хамгийн бага' },
  'create.schedule': { en: 'Schedule', mn: 'Хуваарь' },
  'create.everyDay': { en: 'Every day', mn: 'Өдөр бүр' },
  'create.specificDays': { en: 'Specific days', mn: 'Тодорхой өдрүүд' },
  'create.saveHabit': { en: 'Save Habit', mn: 'Дадал хадгалах' },
  'create.goalTag': { en: 'Goal Tag', mn: 'Зорилгын шошго' },
  'create.personalReason': { en: 'Personal Reason', mn: 'Хувийн шалтгаан' },
  'create.personalReasonPh': { en: 'Why does this habit matter to you?', mn: 'Энэ дадал танд яагаад чухал вэ?' },
  'create.cueConditions': { en: 'Cue Conditions', mn: 'Дохио нөхцөл' },
  'create.timeWindow': { en: 'Time window', mn: 'Цагийн хүрээ' },
  'create.location': { en: 'Location', mn: 'Байршил' },
  'create.precedingRoutine': { en: 'Preceding routine', mn: 'Өмнөх үйлдэл' },

  'nav.home': { en: 'Home', mn: 'Нүүр' },
  'nav.progress': { en: 'Progress', mn: 'Ахиц' },
  'nav.learn': { en: 'Learn', mn: 'Суръя' },
  'nav.reminders': { en: 'Reminders', mn: 'Мэдэгдэл' },

  'learn.title': { en: 'Learn', mn: 'Суралц' },
  'learn.subtitle': { en: 'Understand the science behind your habits', mn: 'Дадлын цаадах шинжлэх ухааныг ойлго' },
};

export function useT() {
  const lang = useLang();
  return (key: string, fallback?: string): string => {
    const entry = translations[key];
    if (!entry) return fallback || key;
    return entry[lang] || entry.en || fallback || key;
  };
}
