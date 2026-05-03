import { useNavigate, useLocation } from 'react-router-dom';
import { BottomNavHomeIcon, BottomNavLearnIcon, BottomNavProfileIcon, BottomNavStatsIcon } from '@/shared/design';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Нүүр', Icon: BottomNavHomeIcon },
    { path: '/analytics', label: 'Ахиц', Icon: BottomNavStatsIcon },
    { path: '/learn', label: 'Суръя', Icon: BottomNavLearnIcon },
    { path: '/profile', label: 'Профайл', Icon: BottomNavProfileIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div
        className="max-w-[430px] w-full pointer-events-auto"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      >
        <div
          id="tour-bottom-nav"
          className="mx-5 mb-2 rounded-[24px] border border-border bg-card flex items-center justify-between px-6 py-3"
          style={{ boxShadow: '10px 14px 56px 0px var(--surface-muted)' }}
        >
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2 transition-all duration-200 ${
                  isActive
                    ? 'rounded-[48px] pl-3 pr-5 py-2.5'
                    : 'p-2'
                }`}
                style={{
                  backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                }}
              >
                <item.Icon active={isActive} />
                {isActive && (
                  <span
                    className="whitespace-nowrap"
                    style={{ fontSize: '14px', fontWeight: 500, color: 'var(--background)' }}
                  >
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
