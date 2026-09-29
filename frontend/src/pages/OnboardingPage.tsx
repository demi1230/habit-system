import { Link } from 'react-router-dom';
import { Plus, Check, ArrowRight } from 'lucide-react';
export function OnboardingPage() {
  return <section className="onboarding-page">
    <p className="eyebrow">Тавтай морил</p><h1>Эхний дадлаа сонгоё.</h1>
    <p className="text-muted-foreground">Өдөр бүр хийж чадах жижиг зүйлээс эхлээрэй.</p>
    <div className="onboarding-example"><span className="eyebrow">Жишээ</span>
      <h2>Өглөө босоод нэг аяга ус уух</h2><p><Plus size={18} /> Дадлаа нэмнэ.</p><p><Check size={18} /> Хийсэн үедээ бүртгэнэ.</p>
    </div>
    <Link to="/create" className="ux-primary">Дадал сонгох <ArrowRight size={18} /></Link>
    <Link to="/dashboard" className="ux-secondary">Дараа болъё</Link>
  </section>;
}
