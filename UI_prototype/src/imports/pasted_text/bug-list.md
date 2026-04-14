Одоо байгаа гол алдаанууд
1. Dashboard дээрх өнөөдрийн төлөв store-оос биш, local state-аас явж байна

src/app/pages/dashboard.tsx

Энд logMap гэж local state байна. Quick log хийвэл дэлгэц дээр харагдана, гэхдээ энэ нь бодит store-ийн truth-тэй үргэлж нийцэхгүй.

Энэ маш том алдаа. Яагаад гэвэл:

refresh хийхэд local state алга болно
detail, analytics, dashboard гурван дэлгэцийн өнөөдрийн статус зөрж магадгүй
“системийн урсгал нэг биш” санагдах том шалтгаан энэ
Засах ёстой зүйл

Dashboard дээрх card status-уудыг:

habit.completions
өнөөдрийн date
trigger_source
is_target_met
partial/completed

гээс derive хийдэг selector болго.

logMap-ийг арилга.

2. Habit detail page дээр mock data одоо ч байна

src/app/pages/habit-detail.tsx

Энд:

mockEvents
mockRecommendations

ашиглаж байна.

Энэ бол prototype-ийн хамгийн эвгүй хэсэг. Учир нь:

зарим хэсэг бодит
зарим хэсэг demo
гэдэг мэдрэмж өгч байна.
Засах ёстой зүйл

3 сонголт байна:

Хувилбар A — хамгийн зөв

store.ts дээр:

HabitEvent[]
Recommendation[]

гэдэг бодит source гаргаад derive хийх

Хувилбар B — түр MVP

Mock section-уудыг бүр ав

event feed-ийг түр нуух
recommendation-ийг зөвхөн бодит дүрэмтэй үед харуулах
Хувилбар C — thesis-friendly

Recommendation-ийг бодит rule-ээр:

completionRate бага
difficulty өндөр
reminder dependency өндөр
streak бага

байвал generate хий.

Одоогийн байдлаар mock recommendation байлгах нь хамгийн том credibility issue.

3. todayCompletion = habit.completions[0] гэж авч байгаа нь аюултай

Мөн src/app/pages/habit-detail.tsx

Энд өнөөдрийн completion-ийг:

const todayCompletion = habit.completions[0];

гээд авч байна.

Гэхдээ энэ нь:

latest completion үргэлж index 0 байна гэсэн таамаг
data ordering өөр бол буруу болно
Засах ёстой зүйл

Өнөөдрийн completion-ийг date match-ээр ол:

new Date().toISOString().split('T')[0]
find(c => c.date === today)
4. Habit strength score thesis-ийн логиктой хараахан нийцэхгүй

src/app/store.ts

Одоогийн:

const consistency = habit.completionRate;
const independence = habit.reminderEnabled ? 45 : 80;
const stability = habit.streak * 7;

Энэ бол placeholder formula.

Ялангуяа:

independence = reminderEnabled ? 45 : 80 гэдэг нь бодит independence биш
self-initiated completion ratio ашиглаагүй
context stability ашиглаагүй
SRBAI ашиглаагүй
Засах ёстой зүйл

getHabitStrength()-ийг 3 түвшинд шинэчил:

MVP practical
consistency
self-initiated ratio
streak/context repeat
Thesis aligned
SRBAI score
consistency
context stability
reminder independence
UI
detail + analytics дээр breakdown нь store-ийн нэг source-оос орж ирдэг болго

Одоогийн getHabitStrength бол зөвхөн placeholder гэж тооц.

5. Bottom navigation системийн логиктойгаа бүрэн таарахгүй

src/app/components/bottom-nav.tsx

Одоо:

Гэр
Ахиц
Суръя
Мэдэгдэл
Асуудал

reminders нь primary tab болоод байна. Гэтэл чиний thesis system-д reminder бол destination биш, habit support mechanism.

Засах ёстой зүйл

Bottom nav-ийг ингэж өөрчил:

Санал болгож буй хувилбар
Гэр
Ахиц
Зөвлөмж / Суръя
Профайл

Мэдэгдэл-ийг:

Profile/settings дотор
эсвэл
per-habit detail дотор reminder settings
болго.

Ингэвэл product structure илүү natural болно.

6. Check-in → Reflection flow route-heavy хэвээрээ байна

src/app/pages/checkin.tsx
src/app/pages/reflection.tsx

Одоогийн flow:

dashboard → /checkin/:id
дараа нь /reflection/:id
дараа нь /dashboard

Энэ нь UI-ийг thesis app гэхээсээ multi-page form app шиг мэдрүүлж байна.

Засах ёстой зүйл

Check-in-ийг:

full page route биш
bottom sheet эсвэл modal flow

болго.

Reflection-ийг:

optional inline step
success-ийн дараах жижиг overlay
болго.
Шалтгаан

Чиний system-ийн core interaction бол low-friction logging. Одоогийн flow жаахан хүнд.

7. Dashboard card tap behavior зөв биш

src/app/pages/dashboard.tsx

Одоо card дээр дарахад detail рүү орно. Badge дээр дарахад quick log гарна.

Асуудал

Өнөөдрийн home screen-ийн primary goal бол:

execution
logging

Гэтэл одоо primary tap нь detail болсон байна.

Засах ёстой зүйл

Card tap behavior-ийг ингэж өөрчил:

card main tap = quick log / open bottom sheet
secondary icon / chevron = detail

эсвэл

card body tap = quick log
long press / small info icon = detail

Home-г execution-first болго.

8. Visual token байгаа ч hardcoded style маш их байна

Олон file дээр:

rgba(0,0,0,0.05)
#474747
#202325
bg-white
rounded-[24px]
rounded-[20px]
rounded-[16px]

гэдэг зүйлс шууд орсон байна.

Асуудал

Token system байгаа мөртлөө UI бүхэлдээ token-driven биш.

Засах ёстой зүйл

Дараах 5 token-г formalize хий:

surface-card
surface-soft
text-primary
text-secondary
radius-card
radius-pill
shadow-card
shadow-cta

Тэгээд:

dashboard.tsx
create-habit.tsx
habit-detail.tsx
analytics.tsx
reminders.tsx

дээр hardcode style-уудыг token/component руу тат.

9. Typography нэгтгэсэн мэт харагдаж байгаа ч page-level inline style хэт их

App.tsx, theme.css дээр Montserrat base өгсөн байна. Энэ нь өмнөхөөс дээр.

Гэхдээ page бүр дээр:

inline font size
inline font weight
inline text color

хэт их байна.

Асуудал

Component hierarchy биш, page-by-page styling болсон.

Засах ёстой зүйл

Typography class-ууд гарга:

text-display
text-title
text-body
text-caption
text-label

Тэгээд inline typography-г аажмаар багасга.

10. Language consistency алдагдсан

Store-ийн initial habits English:

Morning Meditation
Read 20 Pages
Drink 2L Water
Evening Journaling

UI нь ихэнхдээ Монгол.

Асуудал

Prototype нэг хэсэг нь localization demo, нөгөө хэсэг нь product UI шиг харагдаж байна.

Засах ёстой зүйл

MVP хамгаалалтанд:

бүх demo habit-уудаа Монгол болго
эсвэл
бүх UI-г bilingual strategy-тай болгож дуусга

Одоо бол mixed байна.

11. Reminders page secondary байх ёстой

src/app/pages/reminders.tsx

Сайн тал:

static биш болсон
habits-оос reminder татдаг

Гэхдээ асуудал нь энэ page одоо ч app-ийн core page шиг байгаад байна.

Засах ёстой зүйл

Reminders page-ийг:

settings page
эсвэл
habit detail section
рүү шингээ.

Тусдаа primary tab хэвээр байлгах шаардлага багатай.

12. Route architecture дээр prototype/dev routes байгаа

src/app/routes.ts

Одоо:

/design-system
/screens

route-ууд production router дотор байна.

Асуудал

Энэ нь thesis demo-д замбараагүй харагдана.

Засах ёстой зүйл

Dev-only route-уудыг:

хас
эсвэл
dev flag-тэй болго
13. app-screens.tsx, design-system.tsx зэрэг Figma-export prototype file-ууд app code-той хэт ойр байна

Эдгээр нь demo assets маягийн file-ууд.

Асуудал

Кодын бүтэц дээр:

prototype
production app
хоёр хольцолдож байна.
Засах ёстой зүйл

Folder-уудаа салга:

src/app/* → actual app
src/prototype/* → figma export / references
Засах хамгийн зөв plan
Phase 1 — Data truth-ээ нэгтгэ

Энэ хамгийн эхний ажил.

Засах file-ууд
src/app/store.ts
src/app/pages/dashboard.tsx
src/app/pages/habit-detail.tsx
src/app/pages/analytics.tsx
Хийх зүйл
logMap local state-ийг dashboard-с ав
“өнөөдрийн статус” selector хий
todayCompletion-ийг date match-аар ол
getHabitStrength()-ийг шинэчил
analytics/detail/dashboard бүгд ижил derived data ашигла
Энэ phase дуусахад

Аппын screen-үүд хоорондоо өөр өөр үнэнтэй байх асуудал арилна.

Phase 2 — Flow-оо нэг болгож цэгцэл
Засах file-ууд
src/app/components/bottom-nav.tsx
src/app/pages/dashboard.tsx
src/app/pages/checkin.tsx
src/app/pages/reflection.tsx
src/app/pages/reminders.tsx
src/app/routes.ts
Хийх зүйл
bottom nav-аас reminders-ийг primary-оос ав
Home-г execution-first болго
checkin-ийг bottom sheet болгох plan гарга
reflection-ийг optional inline болго
reminders-ийг detail/settings рүү шингээ
Энэ phase дуусахад

App “screen collection” биш, behavior journey болно.

Phase 3 — Detail ба Create screen-ийг thesis system-тэй яг тааруул
Засах file-ууд
src/app/pages/create-habit.tsx
src/app/pages/edit-habit.tsx
src/app/pages/habit-detail.tsx
Хийх зүйл
Create screen-ийг 5 section-той нэг page хэлбэрт үлдээж, hierarchy-г сайжруул
Live sentence preview нэм
Detail дээр дараах дарааллыг тогтмол болго:
header
today status
why
cues
quick log
strength
history
settings
recommendation-ийг mock-аас бодит rule рүү шилжүүл
Энэ phase дуусахад

Чиний system thesis-ийн онолтой илүү шууд харагдана.

Phase 4 — Visual system-ээ түгж
Засах file-ууд
src/styles/theme.css
src/app/App.tsx
src/app/lib/habit-colors.ts
бүх main page file
Хийх зүйл
hardcoded өнгө багасга
radius стандартчил
shadow стандартчил
typography class систем гарга
Mongolian/English content-ийг нэг мөр болго
Энэ phase дуусахад

UI “нэг апп” шиг харагдана.

Phase 5 — Thesis-specific missing feature
Засах file-ууд
src/app/store.ts
src/app/pages/habit-detail.tsx
src/app/pages/analytics.tsx
шинэ src/app/pages/srbai-modal.tsx эсвэл component
Хийх зүйл
reminder explanation card
SRBAI quick survey
reminder dependency indicator
self-initiated completion ratio
adaptive recommendation rule
Миний санал болгож буй шууд priority

Хэрэв чи яг одоо зөвхөн хамгийн чухал 7 зүйлийг засъя гэвэл:

dashboard.tsx дээрх local logMap-ийг арилга
habit-detail.tsx дээрх mockEvents, mockRecommendations-ийг болиул
habit-detail.tsx дээр todayCompletion-ийг зөв date match-аар ол
store.ts дээр getHabitStrength()-ийг бодит proxy logic руу ойртуул
bottom-nav.tsx-аас reminders-ийг primary tab-аас ав
checkin/reflection flow-г нэгтгэх төлөвлөгөө гарга
hardcoded styles-ийг token/component руу тат
Эцсийн үнэлгээ