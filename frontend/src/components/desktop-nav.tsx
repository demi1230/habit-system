import { NavLink } from 'react-router-dom';
import { House, ChartNoAxesCombined, BookOpen, User, Bell, Settings, Plus } from 'lucide-react';
const items = [
  { to: '/dashboard', label: 'Өнөөдөр', Icon: House },
  { to: '/analytics', label: 'Ахиц', Icon: ChartNoAxesCombined },
  { to: '/learn', label: 'Суръя', Icon: BookOpen },
  { to: '/reminders', label: 'Сануулга', Icon: Bell },
  { to: '/profile', label: 'Профайл', Icon: User },
  { to: '/settings', label: 'Тохиргоо', Icon: Settings },
];
export function DesktopNav() {
  return <aside className="desktop-sidebar">
    <NavLink to="/dashboard" className="dadal-wordmark">dadal<span>Өдөр бүр бага багаар.</span></NavLink>
    <NavLink to="/create" className="ux-primary"><Plus size={18} /> Дадал нэмэх</NavLink>
    <nav aria-label="Үндсэн цэс">{items.map(({ to, label, Icon }) =>
      <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'desktop-link active' : 'desktop-link'}>
        <Icon size={20} aria-hidden="true" />{label}
      </NavLink>
    )}</nav>
  </aside>;
}
