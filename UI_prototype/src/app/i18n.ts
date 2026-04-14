import { useSyncExternalStore } from 'react';

export type Lang = 'en' | 'mn';

// ── Language Store ────────────────────────────────────
let currentLang: Lang = (typeof localStorage !== 'undefined' && localStorage.getItem('bloom-lang') as Lang) || 'en';
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

// ── Translation dictionary ───────────────────────────
const translations: Record<string, Record<Lang, string>> = {
  // ── Common / Shared ──
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

  // ── Welcome ──
  'welcome.tagline': { en: 'Build habits that grow with you — gently, flexibly, and at your own pace.', mn: 'Дадлаа өөрийнхөөрөө, зөөлөн, уян хатнаар бий болго.' },
  'welcome.motto': { en: 'Progress over perfection', mn: 'Төгс биш ч ахиц дэвшил' },
  'welcome.getStarted': { en: 'Get Started', mn: 'Эхлэх' },
  'welcome.signIn': { en: 'Sign In', mn: 'Нэвтрэх' },

  // ── Onboarding ──
  'onboarding.step1.title': { en: 'Build habits gently', mn: 'Дадлыг зөөлөн бий болго' },
  'onboarding.step1.desc': { en: 'No guilt, no pressure. We focus on flexible progress — not perfection. Even partial completion counts.', mn: 'Гэм буруугүй, дарамтгүй. Уян хатан ахиц дэвшилд анхаарна — төгс биш. Хэсэгчилсэн гүйцэтгэл ч тооцогдоно.' },
  'onboarding.step2.title': { en: 'Smart reminders', mn: 'Ухаалаг сануулга' },
  'onboarding.step2.desc': { en: "Get reminded at the right time, in the right context. Snooze, reschedule, or skip — it's okay.", mn: 'Зөв цагт, зөв нөхцөлд сануулга авна. Хойшлуулах, дахин товлох, алгасах — зүгээр л.' },
  'onboarding.step3.title': { en: 'Reflect & grow', mn: 'Эргэцүүлэл ба өсөлт' },
  'onboarding.step3.desc': { en: 'After completing a habit, take a moment to notice how you feel. Self-awareness builds lasting change.', mn: 'Дадал гүйцэтгэсний дараа өөрийгөө хэрхэн мэдрэж байгааг анзаар. Өөрийгөө таних нь удаан хугацааны өөрчлөлтийг бий болгоно.' },
  'onboarding.step4.title': { en: 'Choose your goals', mn: 'Зорилгоо сонго' },
  'onboarding.step4.desc': { en: 'Select the goal tags that matter to you. You can always add more later.', mn: 'Танд чухал зорилгын шошгуудыг сонго. Дараа нэмж болно.' },

  // ── Categories / Goal Tags ──
  'cat.health': { en: 'Health', mn: 'Эрүүл мэнд' },
  'cat.study': { en: 'Study', mn: 'Суралцах' },
  'cat.fitness': { en: 'Fitness', mn: 'Фитнес' },
  'cat.mindfulness': { en: 'Mindfulness', mn: 'Сэтгэл зүй' },
  'cat.productivity': { en: 'Productivity', mn: 'Бүтээмж' },
  'cat.creativity': { en: 'Creativity', mn: 'Бүтээлч байдал' },
  'cat.social': { en: 'Social', mn: 'Нийгэм' },
  'cat.finance': { en: 'Finance', mn: 'Санхүү' },

  // ── Goal Tag UI ──
  'goalTag.title': { en: 'Goal Tag', mn: 'Зорилгын шошго' },
  'goalTag.selectTag': { en: 'Select a goal tag', mn: 'Зорилгын шошго сонго' },
  'goalTag.personalReason': { en: 'Personal Reason', mn: 'Хувийн шалтгаан' },
  'goalTag.personalReasonPh': { en: 'Why does this habit matter to you?', mn: 'Энэ дадал яагаад танд чухал вэ?' },
  'goalTag.identity': { en: 'Identity Statement', mn: 'Хэн болмоор байна' },
  'goalTag.identityPh': { en: 'I am someone who...', mn: 'Би бол ...' },
  'goalTag.identityHint': { en: 'Who do you want to become through this habit?', mn: 'Энэ дадлаар хэн болохыг хүсэж байна?' },
  'goalTag.manage': { en: 'Manage Goal Tags', mn: 'Зорилгын шошго удирдах' },
  'goalTag.create': { en: 'Create Tag', mn: 'Шошго үүсгэх' },
  'goalTag.newTag': { en: 'New Goal Tag', mn: 'Шинэ зорилгын шошго' },
  'goalTag.tagName': { en: 'Tag Name', mn: 'Шошгоны нэр' },
  'goalTag.tagNamePh': { en: 'e.g., Self-care', mn: 'жнь., Өөрийгөө хайрлах' },
  'goalTag.chooseEmoji': { en: 'Choose Emoji', mn: 'Эможи сонго' },
  'goalTag.chooseColor': { en: 'Choose Color', mn: 'Өнгө сонго' },
  'goalTag.system': { en: 'System', mn: 'Системийн' },
  'goalTag.custom': { en: 'Custom', mn: 'Хэрэглэгчийн' },
  'goalTag.connectWhy': { en: 'Connect with your "why"', mn: 'Өөрийн "яагаад"-тай холбогд' },
  'goalTag.connectWhyDesc': { en: 'Habits stick better when tied to something meaningful to you.', mn: 'Дадал нь утга учиртай зүйлтэй холбогдсон үед илүү тогтвортой байдаг.' },

  // ── Auth ──
  'auth.resetPassword': { en: 'Reset Password', mn: 'Нууц үг сэргээх' },
  'auth.welcomeBack': { en: 'Welcome back', mn: 'Тавтай морил' },
  'auth.createAccount': { en: 'Create account', mn: 'Бүртгүүлэх' },
  'auth.resetSub': { en: "Enter your email and we'll send you a reset link", mn: 'Имэйлээ оруулна уу, бид сэргээх холбоос илгээнэ' },
  'auth.loginSub': { en: "Let's continue building your habits", mn: 'Дадлаа бий болгож үргэлжлүүлье' },
  'auth.signupSub': { en: 'Start your habit journey today', mn: 'Дадлын аялалаа өнөөдөр эхлүүл' },
  'auth.fullName': { en: 'Full Name', mn: 'Бүтэн нэр' },
  'auth.email': { en: 'Email', mn: 'Имэйл' },
  'auth.password': { en: 'Password', mn: 'Нууц үг' },
  'auth.yourName': { en: 'Your name', mn: 'Таны нэр' },
  'auth.forgotPassword': { en: 'Forgot password?', mn: 'Нууц үг мартсан?' },
  'auth.sendReset': { en: 'Send Reset Link', mn: 'Сэргээх холбоос илгээх' },
  'auth.signInBtn': { en: 'Sign In', mn: 'Нэвтрэх' },
  'auth.createAccountBtn': { en: 'Create Account', mn: 'Бүртгүүлэх' },
  'auth.noAccount': { en: "Don't have an account?", mn: 'Бүртгэл байхгүй юу?' },
  'auth.signUp': { en: 'Sign up', mn: 'Бүртгүүлэх' },
  'auth.hasAccount': { en: 'Already have an account?', mn: 'Бүртгэлтэй юу?' },
  'auth.signInLink': { en: 'Sign in', mn: 'Нэвтрэх' },

  // ── Dashboard ──
  'dash.goodMorning': { en: 'Good morning', mn: 'Өглөөний мэнд' },
  'dash.goodAfternoon': { en: 'Good afternoon', mn: 'Өдрийн мэнд' },
  'dash.goodEvening': { en: 'Good evening', mn: 'Оройн мэнд' },
  'dash.today': { en: 'today', mn: 'өнөөдөр' },
  'dash.dayStreak': { en: 'day streak', mn: 'өдрийн цуваа' },
  'dash.avgStrength': { en: 'avg strength', mn: 'дундаж хүч' },
  'dash.allComplete': { en: "All habits complete today — you're amazing!", mn: 'Бүх дадал дууссан — та гайхалтай!' },
  'dash.someComplete': { en: "You're on your way —", mn: 'Та зам дээрээ —' },
  'dash.moreToGo': { en: 'more to go', mn: 'дутуу байна' },
  'dash.readyWhenYouAre': { en: 'Ready when you are — no pressure, just intention', mn: 'Бэлэн болохоор — дарамтгүй, зүгээр л санаа' },
  'dash.todaysHabits': { en: "Today's Habits", mn: 'Өнөөдрийн дадлууд' },
  'dash.viewAll': { en: 'View all', mn: 'Бүгд' },
  'dash.reminders': { en: 'reminders scheduled today', mn: 'сануулга товлогдсон' },
  'dash.reminder': { en: 'reminder scheduled today', mn: 'сануулга товлогдсон' },
  'dash.next': { en: 'Next:', mn: 'Дараагийн:' },
  'dash.whyMatters': { en: 'Why this matters', mn: 'Энэ яагаад чухал' },
  'dash.whyMattersDesc': { en: "Each small action strengthens the neural pathways of your new identity. You're not just completing tasks — you're becoming the person you want to be.", mn: 'Жижиг үйлдэл бүр таны шинэ зан чанарыг бэхжүүлнэ. Та зүгээр л даалгавар биелүүлээд зогсохгүй — болохыг хүссэн хүнээ болж байна.' },
  'dash.seeProgress': { en: 'See your progress over time', mn: 'Хугацааны туршид ахицаа хар' },
  'dash.chartsStreaks': { en: 'Charts, streaks & weekly trends', mn: 'Графикууд, цувааг ба долоо хоногийн чиг хандлага' },
  'dash.niceWork': { en: 'Nice work! Tap to reflect on how that felt', mn: 'Сайн ажил! Хэрхэн мэдэрснээ эргэцүүлэх' },

  // ── Motivation cards ──
  'motiv.1.text': { en: 'Small steps still count.', mn: 'Жижиг алхам ч тооцогдоно.' },
  'motiv.1.sub': { en: "Every tiny action shapes who you're becoming.", mn: 'Жижиг үйлдэл бүр таныг хэн болохыг тодорхойлно.' },
  'motiv.2.text': { en: "You're building consistency.", mn: 'Та тогтвортой байдлыг бий болгож байна.' },
  'motiv.2.sub': { en: 'The magic is in showing up, not being perfect.', mn: 'Ид шид бол ирж байхад л байна, төгс байхад биш.' },
  'motiv.3.text': { en: 'Progress over perfection.', mn: 'Төгс биш ч ахиц дэвшил.' },
  'motiv.3.sub': { en: 'A little done is always better than nothing.', mn: 'Бага зэрэг хийсэн нь юу ч хийхгүйгээс дээр.' },
  'motiv.4.text': { en: 'You showed up today.', mn: 'Та өнөөдөр ирлээ.' },
  'motiv.4.sub': { en: "That's the hardest part — and you did it.", mn: 'Энэ бол хамгийн хэцүү хэсэг — та үүнийг хийлээ.' },

  // ── Check-in ──
  'checkin.howDidItGo': { en: 'How did it go today?', mn: 'Өнөөдөр яаж боллоо?' },
  'checkin.doneForToday': { en: 'Done for today', mn: 'Өнөөдөр хийсэн' },
  'checkin.partialStillCounts': { en: 'Partial — still counts', mn: 'Хэсэгчлэн — тооцогдоно' },
  'checkin.skipToday': { en: 'Skip today — no judgment', mn: 'Өнөөдөр алгасах — буруушаахгүй' },
  'checkin.logValue': { en: 'Log this value', mn: 'Утга бүртгэх' },
  'checkin.enterValue': { en: 'Enter a value first', mn: 'Эхлээд утга оруулна уу' },
  'checkin.routineSteps': { en: 'Routine Steps', mn: 'Алхмууд' },
  'checkin.checkOffCompleted': { en: 'Check off what you completed — every step counts', mn: 'Хийсэн зүйлээ тэмдэглэ — алхам бүр чухал' },
  'checkin.stepsOf': { en: 'steps', mn: 'алхам' },
  'checkin.allStepsComplete': { en: 'All steps complete — amazing work!', mn: 'Бүх алхам дууссан — гайхалтай!' },
  'checkin.howDidThatFeel': { en: 'How did that feel?', mn: 'Ямар санагдсан бэ?' },
  'checkin.helpsRhythm': { en: 'This helps us understand your rhythm better', mn: 'Энэ бидэнд таны хэмнэлийг илүү сайн ойлгоход тусална' },
  'checkin.skipThis': { en: 'Skip this', mn: 'Алгасах' },
  'checkin.easy': { en: 'Easy', mn: 'Амархан' },
  'checkin.moderate': { en: 'Moderate', mn: 'Дунд зэрэг' },
  'checkin.hard': { en: 'Hard', mn: 'Хэцүү' },
  'checkin.veryHard': { en: 'Very hard', mn: 'Маш хэцүү' },
  'checkin.didYouComplete': { en: 'Did you complete this today?', mn: 'Та өнөөдөр үүнийг хийсэн үү?' },
  'checkin.anyEffort': { en: 'Any effort at all is worth celebrating.', mn: 'Ямар ч хүчин чармайлт тэмдэглэх зүйл юм.' },

  // ── Difficulty feedback ──
  'diff.easy': { en: 'Great flow — this habit is getting easier for you!', mn: 'Гайхалтай! Энэ дадал танд хялбар болж байна!' },
  'diff.moderate': { en: 'Solid effort — consistency will make this smoother.', mn: 'Сайн хүчин чармайлт — тогтвортой байх нь хялбарчлана.' },
  'diff.hard': { en: 'Tough ones build the most strength. You showed up.', mn: 'Хэцүү зүйл хамгийн их хүч чадал бий болгоно. Та ирлээ.' },
  'diff.veryHard': { en: 'Your honesty matters. We can help adjust this to work better for you.', mn: 'Таны шударга байдал чухал. Энэ дадлыг танд тохируулахад тусалъя.' },

  // ── Encouragements ──
  'enc.done.1.title': { en: 'Well done!', mn: 'Сайн хийлээ!' },
  'enc.done.1.sub': { en: 'Every step brings you closer to who you want to be.', mn: 'Алхам үр таныг хүсэж байгаа хүндээ ойртуулна.' },
  'enc.done.2.title': { en: 'You showed up!', mn: 'Та ирлээ!' },
  'enc.done.2.sub': { en: "That's the hardest part — and you nailed it.", mn: 'Энэ бол хамгийн хэцүү хэсэг — та амжилттай хийлээ.' },
  'enc.done.3.title': { en: 'Beautiful!', mn: 'Гайхалтай!' },
  'enc.done.3.sub': { en: 'Consistency like this is where the magic happens.', mn: 'Ийм тогтвортой байдал бол ид шид юм.' },
  'enc.partial.1.title': { en: 'A little done is still done', mn: 'Бага зэрэг хийсэн ч хийсэн хэвээр' },
  'enc.partial.1.sub': { en: 'Partial progress builds real momentum.', mn: 'Хэсэгчилсэн ахиц бодит эрч хүч бий болгоно.' },
  'enc.partial.2.title': { en: 'Every bit counts', mn: 'Нэг бүр нь тооцогдоно' },
  'enc.partial.2.sub': { en: "You didn't skip — that takes strength.", mn: 'Та алгасаагүй — энэ хүч чадал шаарддаг.' },
  'enc.skipped.1.title': { en: "That's okay", mn: 'Зүгээр дээ' },
  'enc.skipped.1.sub': { en: 'Rest is part of the journey. Tomorrow is a fresh start.', mn: 'Амрах нь аялалын нэг хэсэг. Маргааш шинэ эхлэл.' },
  'enc.skipped.2.title': { en: 'No judgment here', mn: 'Шүүмжлэхгүй' },
  'enc.skipped.2.sub': { en: 'Taking a break is a form of self-care too.', mn: 'Амрах нь өөрийгөө халамжлах хэлбэр юм.' },

  // ── Reflection ──
  'refl.howFeeling': { en: 'How are you feeling?', mn: 'Та яаж байна?' },
  'refl.checkInSelf': { en: 'Take a moment to check in with yourself', mn: 'Өөрийгөө шалгахад хором зарцуул' },
  'refl.energyFocus': { en: 'Energy & Focus', mn: 'Энерги ба Анхаарал' },
  'refl.bodyMind': { en: "How's your body and mind right now?", mn: 'Бие ба оюун санаа яаж байна?' },
  'refl.energyLevel': { en: 'Energy level', mn: 'Энергийн түвшин' },
  'refl.mentalClarity': { en: 'Mental clarity', mn: 'Оюуны тодорхой байдал' },
  'refl.whatElse': { en: 'What else came up?', mn: 'Өөр юу мэдрэгдсэн бэ?' },
  'refl.pickAny': { en: 'Pick any that resonate — or skip ahead', mn: 'Тохирохыг нь сонго — эсвэл алгас' },
  'refl.anythingElse': { en: 'Anything else?', mn: 'Өөр зүйл?' },
  'refl.quickNote': { en: 'A quick note for your future self — totally optional', mn: 'Ирээдүйн өөртөө тэмдэглэл — заавал биш' },
  'refl.notePlaceholder': { en: 'What felt different today? What would you tell yourself tomorrow?', mn: 'Өнөөдөр юу өөрөөр мэдрэгдсэн бэ? Маргааш өөртөө юу хэлэх вэ?' },
  'refl.finishReflection': { en: 'Finish Reflection', mn: 'Эргэцүүлэл дуусгах' },
  'refl.skipStep': { en: 'Skip this step', mn: 'Энэ алхмыг алгасах' },
  'refl.backToDash': { en: 'Back to Dashboard', mn: 'Хянах самбар руу буцах' },

  // ── Mood options ──
  'mood.great': { en: 'Great', mn: 'Маш сайн' },
  'mood.good': { en: 'Good', mn: 'Сайн' },
  'mood.okay': { en: 'Okay', mn: 'Дажгүй' },
  'mood.low': { en: 'Low', mn: 'Муу' },
  'mood.stressed': { en: 'Stressed', mn: 'Стресстэй' },

  // ── Energy/Focus ──
  'energy.high': { en: 'High', mn: 'Өндөр' },
  'energy.moderate': { en: 'Moderate', mn: 'Дунд' },
  'energy.low': { en: 'Low', mn: 'Бага' },
  'energy.drained': { en: 'Drained', mn: 'Шавхагдсан' },
  'focus.sharp': { en: 'Sharp', mn: 'Хурц' },
  'focus.present': { en: 'Present', mn: 'Тодорхой' },
  'focus.scattered': { en: 'Scattered', mn: 'Тархсан' },
  'focus.foggy': { en: 'Foggy', mn: 'Бүдэг' },

  // ── Feelings ──
  'feel.proud': { en: 'Proud', mn: 'Бахархалтай' },
  'feel.calm': { en: 'Calm', mn: 'Тайван' },
  'feel.energized': { en: 'Energized', mn: 'Энергитэй' },
  'feel.grateful': { en: 'Grateful', mn: 'Талархалтай' },
  'feel.hopeful': { en: 'Hopeful', mn: 'Найдвартай' },
  'feel.curious': { en: 'Curious', mn: 'Сонирхолтой' },
  'feel.relieved': { en: 'Relieved', mn: 'Тайвширсан' },
  'feel.inspired': { en: 'Inspired', mn: 'Урам зоригтой' },

  // ── Analytics ──
  'analytics.title': { en: 'Progress', mn: 'Ахиц дэвшил' },
  'analytics.subtitle': { en: "You're doing better than you think", mn: 'Та бодсоноос илүү сайн хийж байна' },
  'analytics.avgCompletion': { en: 'Avg Completion', mn: 'Дундаж гүйцэтгэл' },
  'analytics.bestStreak': { en: 'Best Streak', mn: 'Хамгийн урт цуваа' },
  'analytics.avgStrength': { en: 'Avg Strength', mn: 'Дундаж хүч' },
  'analytics.totalXP': { en: 'Total XP', mn: 'Нийт XP' },
  'analytics.reminderDep': { en: 'Reminder Dependence', mn: 'Сануулгын хамаарал' },
  'analytics.independent': { en: "You're becoming more independent — great sign of habit formation!", mn: 'Та илүү бие даасан болж байна — дадал бүрэлдэж буй сайн шинж!' },
  'analytics.weeklyConsistency': { en: 'Weekly Consistency', mn: 'Долоо хоногийн тогтвортой байдал' },
  'analytics.allDone': { en: 'All done', mn: 'Бүгд дууссан' },
  'analytics.partial': { en: 'Partial', mn: 'Хэсэгчилсэн' },
  'analytics.habitStrength': { en: 'Habit Strength', mn: 'Дадлын хүч' },
  'analytics.recentWins': { en: 'Recent Wins', mn: 'Сүүлийн амжилтууд' },
  'analytics.howFeeling': { en: "How you've been feeling", mn: 'Та яаж байсан бэ' },
  'analytics.remember': { en: 'Remember: consistency beats intensity. You\'re building something lasting.', mn: 'Санаарай: тогтвортой байдал нь эрчимт чармайлтаас давна. Та удаан хугацааны зүйл бий болгож байна.' },
  'analytics.days': { en: 'days', mn: 'өдөр' },

  // ── Habit Detail ──
  'detail.today': { en: 'Today', mn: 'Өнөөдөр' },
  'detail.completed': { en: 'Completed', mn: 'Гүйцэтгэсэн' },
  'detail.missed': { en: 'Missed', mn: 'Алдсан' },
  'detail.notLogged': { en: 'Not logged yet', mn: 'Бүртгэгдээгүй' },
  'detail.log': { en: 'Log', mn: 'Бүртгэх' },
  'detail.whyMatters': { en: 'Why this matters', mn: 'Яагаад чухал' },
  'detail.streak': { en: 'Streak', mn: 'Цуваа' },
  'detail.strength': { en: 'Strength', mn: 'Хүч' },
  'detail.score': { en: 'score', mn: 'оноо' },
  'detail.completion': { en: 'Completion', mn: 'Гүйцэтгэл' },
  'detail.rate': { en: 'rate', mn: 'хувь' },
  'detail.xpEarned': { en: 'XP Earned', mn: 'Цуглуулсан XP' },
  'detail.points': { en: 'points', mn: 'оноо' },
  'detail.habitStrength': { en: 'Habit Strength', mn: 'Дадлын хүч' },
  'detail.consistency': { en: 'Consistency', mn: 'Тогтвортой байдал' },
  'detail.reminderIndep': { en: 'Reminder independence', mn: 'Сануулгын бие даасан байдал' },
  'detail.contextStability': { en: 'Context stability', mn: 'Нөхцөл байдлын тогтвортой байдал' },
  'detail.strong': { en: 'This habit is becoming part of who you are.', mn: 'Энэ дадал таны нэг хэсэг болж байна.' },
  'detail.building': { en: "You're building momentum — keep going.", mn: 'Та эрч хүч бий болгож байна — үргэлжлүүл.' },
  'detail.growing': { en: 'Every day you show up, this habit gets stronger.', mn: 'Өдөр бүр ирэх тусам энэ дадал бэхэжнэ.' },
  'detail.suggestion': { en: 'Suggestion', mn: 'Зөвлөмж' },
  'detail.soundsGood': { en: 'Sounds good', mn: 'Сайн санаа' },
  'detail.notNow': { en: 'Not now', mn: 'Одоо биш' },
  'detail.applied': { en: 'Applied — nice move!', mn: 'Хэрэгжүүлсэн — сайн алхам!' },
  'detail.schedule': { en: 'Schedule', mn: 'Хуваарь' },
  'detail.contextCues': { en: 'Context & Cues', mn: 'Нөхцөл ба дохио' },
  'detail.recentEvents': { en: 'Recent Events', mn: 'Сүүлийн үйл явдлууд' },
  'detail.recentActivity': { en: 'Recent Activity', mn: 'Сүүлийн идэвхжил' },
  'detail.noCompletions': { en: 'No completions yet', mn: 'Гүйцэтгэл байхгүй байна' },
  'detail.startToday': { en: 'Start today — every step counts', mn: 'Өнөөдрөөс эхэл — алхам бүр чухал' },
  'detail.archiveHabit': { en: 'Archive this habit?', mn: 'Энэ дадлыг архивлах уу?' },
  'detail.archiveDesc': { en: "Great job! Archiving means you've built this habit into your routine. You can always restore it later.", mn: 'Сайн хийлээ! Архивлах гэдэг нь та энэ дадлыг өдөр тутмынхаа нэг хэсэг болгосон гэсэн үг. Хүссэн үедээ сэргээж болно.' },
  'detail.yesArchive': { en: 'Yes, archive it', mn: 'Тийм, архивлах' },
  'detail.keepActive': { en: 'Keep it active', mn: 'Идэвхтэй хэвээр' },
  'detail.habitChunks': { en: 'Habit Chunks', mn: 'Дадлын алхмууд' },
  'detail.countsAsDone': { en: 'counts as done', mn: 'гүйцэтгэсэнд тооцно' },
  'detail.days': { en: 'days', mn: 'өдөр' },

  // ── Reminders ──
  'reminders.title': { en: 'Reminders', mn: 'Сануулгууд' },
  'reminders.quietHours': { en: 'Quiet Hours', mn: 'Чимээгүй цаг' },
  'reminders.quietDesc': { en: 'No reminders 11 PM - 7 AM', mn: 'Шөнийн 11 - Өглөөний 7 хүртэл сануулга байхгүй' },
  'reminders.flexible': { en: 'Flexible reminders', mn: 'Уян хатан сануулга' },
  'reminders.flexDesc': { en: "If a reminder comes at a bad time, you can always snooze or reschedule. We'll learn your patterns over time.", mn: 'Сануулга тохиромжгүй цагт ирвэл хойшлуулах буюу дахин товлож болно. Бид таны хэвшилийг цаг хугацааны явцад суралцана.' },
  'reminders.yourReminders': { en: 'Your Reminders', mn: 'Таны сануулгууд' },
  'reminders.snooze': { en: 'Snooze Options', mn: 'Хойшлуулах сонголтууд' },
  'reminders.snoozeDesc': { en: 'When you snooze, pick a delay that works:', mn: 'Хойшлуулахдаа тохирох хугацаа сонго:' },

  // ── Archive ──
  'archive.title': { en: 'Archive', mn: 'Архив' },
  'archive.subtitle': { en: "Habits you've stabilized or paused", mn: 'Тогтворжсон эсвэл түр зогсоосон дадлууд' },
  'archive.whatsHere': { en: "What's in the archive?", mn: 'Архивд юу байна?' },
  'archive.desc': { en: "Habits here have become part of your routine — congratulations! You can always restore them if needed.", mn: 'Эндэх дадлууд таны өдөр тутмын нэг хэсэг болсон — баяр хүргэе! Хэрэгтэй үед сэргээж болно.' },
  'archive.noHabits': { en: 'No archived habits yet', mn: 'Архивлагдсан дадал байхгүй' },
  'archive.noHabitsDesc': { en: 'Once a habit becomes automatic, you can archive it here', mn: 'Дадал автоматжсаны дараа энд архивлах боломжтой' },
  'archive.stabilized': { en: 'Stabilized', mn: 'Тогтворжсон' },

  // ── Profile ──
  'profile.title': { en: 'Profile', mn: 'Профайл' },
  'profile.memberSince': { en: 'Member since March 2026', mn: '2026 оны 3-р сараас гишүүн' },
  'profile.totalLogs': { en: 'Total Logs', mn: 'Нийт бүртгэл' },
  'profile.archived': { en: 'Archived', mn: 'Архивлагдсан' },
  'profile.notifications': { en: 'Notification Preferences', mn: 'Мэдэгдлийн тохиргоо' },
  'profile.theme': { en: 'Theme & Appearance', mn: 'Загвар ба гадаад төрх' },
  'profile.privacy': { en: 'Privacy', mn: 'Нууцлал' },
  'profile.appPrefs': { en: 'App Preferences', mn: 'Аппын тохиргоо' },
  'profile.language': { en: 'Language', mn: 'Хэл' },
  'profile.signOut': { en: 'Sign Out', mn: 'Гарах' },
  'profile.builtWith': { en: 'Built with care for your growth', mn: 'Таны өсөлтөд зориулж хийсэн' },

  // ── Theme ──
  'theme.title': { en: 'Appearance', mn: 'Харагдах байдал' },
  'theme.light': { en: 'Light', mn: 'Цайвар' },
  'theme.dark': { en: 'Dark', mn: 'Бараан' },
  'theme.system': { en: 'System', mn: 'Систем' },

  // ── Create/Edit Habit ──
  'create.title': { en: 'Create Habit', mn: 'Дадал үүсгэх' },
  'create.edit': { en: 'Edit Habit', mn: 'Дадал засах' },
  'create.habitName': { en: 'Habit Name', mn: 'Дадлын нэр' },
  'create.habitNamePh': { en: 'e.g., Morning meditation', mn: 'жнь., Өглөөний бясалгал' },
  'create.descOptional': { en: 'Description (optional)', mn: 'Тайлбар (заавал биш)' },
  'create.descPh': { en: 'What does this habit look like for you?', mn: 'Энэ дадал танд ямар харагдах вэ?' },
  'create.category': { en: 'Category', mn: 'Ангилал' },
  'create.habitType': { en: 'How will you track this?', mn: 'Үүнийг хэрхэн хянах вэ?' },
  'create.yesNo': { en: 'Done / Not done', mn: 'Хийсэн / Хийгээгүй' },
  'create.didOrNot': { en: 'Simply mark it complete', mn: 'Зүгээр л хийснээ тэмдэглэ' },
  'create.measurable': { en: 'Track by number', mn: 'Тоогоор хянах' },
  'create.trackValue': { en: 'Count reps, minutes, pages, etc.', mn: 'Давталт, минут, хуудас гэх мэт тоол' },
  'create.unit': { en: 'What are you counting?', mn: 'Юу тоолох вэ?' },
  'create.target': { en: 'Daily goal', mn: 'Өдрийн зорилт' },
  'create.minimum': { en: 'Minimum to count', mn: 'Тооцогдох хамгийн бага' },
  'create.partialCounts': { en: 'Even partial effort counts', mn: 'Бүрэн биш ч тооцогдоно' },
  'create.habitChunks': { en: 'Habit Chunks', mn: 'Дадлын алхмууд' },
  'create.breakDown': { en: 'Break your habit into small actions you can realistically do.', mn: 'Дадлаа бодитоор хийж чадах жижиг алхмуудад хуваа.' },
  'create.chunkName': { en: 'Chunk name', mn: 'Алхмын нэр' },
  'create.description': { en: 'Description', mn: 'Тайлбар' },
  'create.optional': { en: 'optional', mn: 'заавал биш' },
  'create.duration': { en: 'Duration', mn: 'Хугацаа' },
  'create.addChunk': { en: 'Add a chunk', mn: 'Алхам нэмэх' },
  'create.addAnother': { en: 'Add another chunk', mn: 'Өөр алхам нэмэх' },
  'create.skipChunks': { en: 'Skip this step', mn: 'Энэ алхмыг алгасах' },
  'create.startSmall': { en: 'Start small to make the habit easier to repeat. Tiny actions build big momentum over time.', mn: 'Жижигээс эхлэхэд дадлыг давтахад хялбар болно. Жижиг алхмууд цаг хугацааны туршид том эрч хүч бий болгоно.' },
  'create.allowChunks': { en: 'Allow chunks as successful completion', mn: 'Алхмуудыг амжилттай гүйцэтгэлд тооцох' },
  'create.completingAny': { en: 'Completing any chunk will count as a successful day', mn: 'Аль нэг алхмыг хийвэл амжилттай өдөрт тооцно' },
  'create.schedule': { en: 'Schedule', mn: 'Хуваарь' },
  'create.everyDay': { en: 'Every day', mn: 'Өдөр бүр' },
  'create.allDays': { en: 'All 7 days', mn: 'Бүх 7 өдөр' },
  'create.specificDays': { en: 'Specific days', mn: 'Тодорхой өдрүүд' },
  'create.chooseWhich': { en: 'Choose which', mn: 'Аль нэгийг нь' },
  'create.selectOneDay': { en: 'Select at least one day', mn: 'Наад зах нь нэг өдөр сонго' },
  'create.daysSelected': { en: 'days selected', mn: 'өдөр сонгосон' },
  'create.daySelected': { en: 'day selected', mn: 'өдөр сонгосон' },
  'create.cueConditions': { en: 'Cue Conditions', mn: 'Дохио нөхцөл' },
  'create.cueDesc': { en: 'Set conditions that help the system remind you at the right moment.', mn: 'Зөв мөчид сануулахад тусалсан нөхцөлүүд тохируул.' },
  'create.timeWindow': { en: 'Time window', mn: 'Цагийн хүрээ' },
  'create.timeWindowDesc': { en: 'Set a reminder time range', mn: 'Сануулгын цагийн хүрээ тохируул' },
  'create.location': { en: 'Location', mn: 'Байршил' },
  'create.locationDesc': { en: 'Remind at a saved place', mn: 'Хадгалсан газарт сануулах' },
  'create.selectPlace': { en: 'Select a place', mn: 'Газар сонгох' },
  'create.precedingRoutine': { en: 'Preceding routine', mn: 'Өмнөх үйлдэл' },
  'create.linkExisting': { en: 'Link to an existing habit', mn: 'Одоо байгаа дадалтай холбох' },
  'create.cueInfo': { en: 'You can use one or multiple cue conditions.', mn: 'Нэг эсвэл олон дохио нөхцөл ашиглаж болно.' },
  'create.allMatch': { en: 'Reminders are sent when all', mn: 'Бүх' },
  'create.selectedConditions': { en: 'selected conditions match.', mn: 'сонгосон нөхцөл таарах үед сануулга илгээгдэнэ.' },
  'create.ifThen': { en: 'If–Then Plan', mn: 'Хэрэв–Тэгвэл төлөвлөгөө' },
  'create.ifThenDesc': { en: 'Define when and what you will do. This makes your habit automatic.', mn: 'Хэзээ, юу хийхээ тодорхойл. Энэ нь дадлыг автоматжуулна.' },
  'create.ifLabel': { en: 'If', mn: 'Хэрэв' },
  'create.thenLabel': { en: 'Then', mn: 'Тэгвэл' },
  'create.ifPlaceholder': { en: 'it\'s 7am and I\'m in the kitchen...', mn: 'өглөөний 7 цаг болж, гал тогоонд байвал...' },
  'create.thenPlaceholder': { en: 'I will meditate for 5 minutes', mn: '5 минут бясалгал хийнэ' },
  'create.ifThenExample': { en: 'e.g., If it\'s after breakfast → Then I\'ll read 2 pages', mn: 'Жишээ: Хэрэв өглөөний цайны дараа бол → 2 хуудас уншина' },
  'create.required': { en: 'Required', mn: 'Заавал' },
  'create.ifMultiple': { en: 'If multiple conditions are selected, reminders are sent when all match.', mn: 'Олон нөхцөл сонгосон бол бүх нөхцөл таарах үед сануулга илгээгдэнэ.' },
  'create.connectWhy': { en: 'Connect with your "why"', mn: '"Яагаад" гэсэн шалтгаантай холбогд' },
  'create.stickBetter': { en: 'Habits stick better when tied to something meaningful to you.', mn: 'Дадал нь танд утга учиртай зүйлтэй холбоотой байвал илүү бэхждэг.' },
  'create.goalTag': { en: 'Goal Tag', mn: 'Зорилгын шошго' },
  'create.personalReason': { en: 'Personal Reason', mn: 'Хувийн шалтгаан' },
  'create.personalReasonPh': { en: 'Why does this habit matter to you?', mn: 'Энэ дадал танд яагаад чухал вэ?' },
  'create.identityStatement': { en: 'Identity Statement', mn: 'Хэн болмоор байна' },
  'create.identityPh': { en: 'I am someone who...', mn: 'Би бол ... хүн' },
  'create.identityDesc': { en: 'Who do you want to become through this habit?', mn: 'Энэ дадлаар хэн болохыг хүсэж байна?' },
  'create.lookingGood': { en: "Looking good! Here's your habit summary.", mn: 'Сайхан байна! Таны дадлын хураангуй.' },
  'create.habit': { en: 'Habit', mn: 'Дадал' },
  'create.type': { en: 'Type', mn: 'Төрөл' },
  'create.daysPerWeek': { en: 'days/week', mn: 'өдөр/долоо хоног' },
  'create.cueConditionsCount': { en: 'Cue conditions', mn: 'Доио нөхцөл' },
  'create.whyThisMatters': { en: 'Why this matters', mn: 'Яагаад чухал' },
  'create.countsAsCompletion': { en: 'Counts as completion', mn: 'Гүйцэтгэлд тооцно' },
  'create.saveHabit': { en: 'Save Habit', mn: 'Дадал хадгалах' },
  'create.habitCreated': { en: 'Habit created!', mn: 'Дадал үүсгэгдлээ!' },
  'create.readyToBloom': { en: 'Your new habit is ready to bloom', mn: 'Таны шинэ дадал цэцэглэхэд бэлэн' },
  'create.habitUpdated': { en: 'Habit updated!', mn: 'Дадал шинэчлэгдлээ!' },
  'create.changesSaved': { en: 'Your changes have been saved', mn: 'Таны өөрчлөлт хадгалагдлаа' },
  'create.deleteHabit': { en: 'Delete Habit', mn: 'Дадал устгах' },
  'create.deleteConfirm': { en: 'Are you sure? This cannot be undone.', mn: 'Итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.' },
  'create.minutes': { en: 'minutes', mn: 'минут' },
  'create.start': { en: 'Start', mn: 'Эхлэх' },
  'create.end': { en: 'End', mn: 'Дуусгах' },
  'create.to': { en: 'to', mn: 'хүртэл' },
  'create.reminderTime': { en: 'Reminder can be sent during this time range', mn: 'Энэ цагийн хүрээнд сануулга илгээж болно' },
  'create.placeContext': { en: 'Uses general place context, not precise live tracking', mn: 'Ерөнхий байршлын мэдээлэл ашиглана, нарийн байршил биш' },

  // ── Step labels ──
  'step.basics': { en: 'Basics', mn: 'Үндэс' },
  'step.nameTag': { en: 'Name & Tag', mn: 'Нэр & Шошго' },
  'step.yourWhy': { en: 'Your Why', mn: 'Таны шалтгаан' },
  'step.tracking': { en: 'Tracking', mn: 'Хяналт' },
  'step.measure': { en: 'Tracking', mn: 'Хяналт' },
  'step.measureIntro': { en: 'Choose how you want to track your progress — simple or detailed, it\'s up to you.', mn: 'Ахицаа хэрхэн хянахаа сонго — энгийн эсвэл дэлгэрэнгүй, өөрөө шийднэ.' },
  'step.habitChunk': { en: 'Habit Chunk', mn: 'Дадлын алхам' },
  'step.chunks': { en: 'Steps', mn: 'Алхмууд' },
  'step.habitChunks': { en: 'Habit Chunks', mn: 'Дадлын алхмууд' },
  'step.scheduleCues': { en: 'Schedule & Cues', mn: 'Хуваарь & Дохио' },
  'step.review': { en: 'Review', mn: 'Хянах' },
  'step.stepOf': { en: 'Step', mn: 'Алхам' },
  'step.of': { en: 'of', mn: '-н' },

  // ── Bottom Nav ──
  'nav.home': { en: 'Home', mn: 'Нүүр' },
  'nav.progress': { en: 'Progress', mn: 'Ахиц' },
  'nav.new': { en: 'New', mn: 'Шинэ' },
  'nav.archive': { en: 'Archive', mn: 'Архив' },
  'nav.profile': { en: 'Profile', mn: 'Профайл' },

  // ── Places ──
  'place.home': { en: 'Home', mn: 'Гэр' },
  'place.school': { en: 'School', mn: 'Сургууль' },
  'place.gym': { en: 'Gym', mn: 'Фитнес заал' },
  'place.work': { en: 'Work', mn: 'Ажил' },

  // ── Routine suggestions ──
  'routine.afterBreakfast': { en: 'After breakfast', mn: 'Өглөөний хоолны дараа' },
  'routine.afterBrushing': { en: 'After brushing teeth', mn: 'Шүд угаасны дараа' },
  'routine.afterShower': { en: 'After shower', mn: 'Шүршүүрийн дараа' },
  'routine.afterWaking': { en: 'After waking up', mn: 'Сэрсний дараа' },
  'routine.afterLunch': { en: 'After lunch', mn: 'Үдийн хоолны дараа' },
  'routine.beforeBed': { en: 'Before bed', mn: 'Унтахын өмнө' },

  // ── Unnamed / misc ──
  'misc.unnamed': { en: 'Unnamed', mn: 'Нэргүй' },
  'misc.unnamedChunk': { en: 'Unnamed chunk', mn: 'Нэргүй алхам' },
  'misc.untitled': { en: 'Untitled', mn: 'Нэргүй' },
};

// ── Hook ──────────────────────────────────────────────
export function useT() {
  const lang = useLang();
  return (key: string, fallback?: string): string => {
    const entry = translations[key];
    if (!entry) return fallback || key;
    return entry[lang] || entry.en || fallback || key;
  };
}