import { Link } from 'react-router-dom';
import { Check, Circle, ArrowRight } from 'lucide-react';
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
        <p className="eyebrow">Жишээ · Өнөөдөр</p><h2>Өөртөө зориулах цаг</h2>
        <div className="preview-row completed"><Check size={22} /><span>Нэг аяга ус уух<small>Өглөө босоод</small></span><span>✓</span></div>
        <div className="preview-row"><Circle size={22} /><span>10 хуудас унших<small>Унтахын өмнө</small></span><span>+</span></div>
        <div className="preview-progress"><span /></div><p className="text-muted-foreground text-sm">1 / 2 дадал хийсэн</p>
      </section>
    </div>
  </div>;
}
