import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { DashboardHabitCard, type DashboardHabit } from '@/components/dashboard-habit-card';

const exampleHabits: DashboardHabit[] = [
  { id: 'example-water', title: 'Нэг аяга ус уух', color: 'sky', iconValue: '💧', currentStreak: 3, strengthScore: 24, targetValue: 1, measurementUnit: 'удаа' },
  { id: 'example-reading', title: '10 хуудас унших', color: 'peach', iconValue: '📖', currentStreak: 5, strengthScore: 38, targetValue: 10, measurementUnit: 'хуудас' },
];
const noop = () => {};

export function WelcomePage() {
  return <div className="welcome-page">
    <header className="welcome-header"><span className="dadal-wordmark">dadal</span><Link to="/login">Нэвтрэх</Link></header>
    <div className="welcome-layout">
      <section>
        <p className="eyebrow">Өдөр бүр бага багаар</p>
        <h1>Нэг жижиг дадлаас<br />эхэлье.</h1>
        <p className="welcome-description">Хийх зүйлээ сонго. Өдөр бүр бүртгэ. Ахицаа хар.</p>
        <Link className="ux-primary" to="/signup">Эхний дадлаа үүсгэх <ArrowRight size={18} /></Link>
        <p className="welcome-signin">Бүртгэлтэй юу? <Link to="/login">Нэвтрэх</Link></p>
      </section>
      <section className="habit-preview" aria-label="Дадлын жагсаалтын жишээ">
        <h2>Өөртөө зориулах цаг</h2>
        <div className="flex items-center justify-between mb-3 text-muted-foreground" style={{ fontSize: 12 }}>
          <span>Өнөөдрийн дадлууд</span><span>1/2 дадал</span>
        </div>
        <div role="img" aria-label="Дадлын жишээ: ус уух дадал хийсэн, 10 хуудас унших дадал хийгээгүй.">
          <div inert className="grid gap-2.5">
            {exampleHabits.map((habit, index) => <DashboardHabitCard
              key={habit.id} habit={habit} index={index}
              entry={index === 0 ? { value: 1, status: 'done' } : undefined}
              onBadgeTap={noop}
            />)}
          </div>
        </div>
      </section>
    </div>
  </div>;
}
