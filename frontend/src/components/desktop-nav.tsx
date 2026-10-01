import { NavLink, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { navigationItems } from './navigation-items';

export function DesktopNav() {
  const { pathname } = useLocation();

  return <aside className="desktop-sidebar">
    <NavLink to="/dashboard" className="dadal-wordmark">dadal<span>Өдөр бүр бага багаар.</span></NavLink>
    <NavLink to="/create" className="ux-primary"><Plus size={18} /> Дадал нэмэх</NavLink>
    <nav aria-label="Үндсэн цэс">{navigationItems.map(({ path, label, Icon }) => {
      const active = pathname.startsWith(path);
      return <NavLink key={path} to={path} aria-current={active ? 'page' : undefined}
        className={`desktop-link${active ? ' active' : ''}`}>
        <Icon active={active} />
        <span>{label}</span>
      </NavLink>;
    })}</nav>
  </aside>;
}
