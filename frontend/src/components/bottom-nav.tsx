import { useNavigate, useLocation } from 'react-router-dom';

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22.5 22.5" fill="none">
      <path
        d="M9.75 19.5V14.25H12.75V19.5H16.5V12.75H19.5L11.25 4.5L3 12.75H6V19.5H9.75Z"
        fill={active ? 'var(--color-primary-foreground)' : 'var(--color-muted-foreground)'}
      />
    </svg>
  );
}

function StatsIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="20" viewBox="0 0 22 20" fill="none">
      <rect x="1" y="10" width="4" height="9" rx="2" fill={active ? 'var(--color-primary-foreground)' : 'var(--color-muted-foreground)'} />
      <rect x="7" y="5" width="4" height="14" rx="2" fill={active ? 'var(--color-primary-foreground)' : 'var(--color-muted-foreground)'} />
      <rect x="13" y="1" width="4" height="18" rx="2" fill={active ? 'var(--color-primary-foreground)' : 'var(--color-muted-foreground)'} />
    </svg>
  );
}

function LearnIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="22" viewBox="0 0 17 21" fill="none">
      <path
        d="M14.5 0H2.5C1.4 0 0.5 0.9 0.5 2V19C0.5 20.1 1.4 21 2.5 21H14.5C15.6 21 16.5 20.1 16.5 19V2C16.5 0.9 15.6 0 14.5 0ZM14.5 19H2.5V2H14.5V19ZM4.5 10H12.5V12H4.5V10ZM4.5 14H9.5V16H4.5V14ZM4.5 6H12.5V8H4.5V6Z"
        fill={active ? 'var(--color-primary-foreground)' : 'var(--color-muted-foreground)'}
      />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="22" viewBox="0 0 20 22" fill="none">
      <path
        d="M10 11C12.21 11 14 9.21 14 7C14 4.79 12.21 3 10 3C7.79 3 6 4.79 6 7C6 9.21 7.79 11 10 11ZM10 13C7.33 13 2 14.34 2 17V19H18V17C18 14.34 12.67 13 10 13Z"
        fill={active ? 'var(--color-primary-foreground)' : 'var(--color-muted-foreground)'}
      />
    </svg>
  );
}

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Нүүр', Icon: HomeIcon },
    { path: '/analytics', label: 'Ахиц', Icon: StatsIcon },
    { path: '/learn', label: 'Суръя', Icon: LearnIcon },
    { path: '/profile', label: 'Профайл', Icon: ProfileIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div
        className="max-w-[430px] w-full pointer-events-auto"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      >
        <div
          className="mx-5 mb-2 bg-white rounded-[24px] flex items-center justify-between px-6 py-3 dark:bg-card"
          style={{ boxShadow: '10px 14px 56px 0px rgba(0,0,0,0.12)' }}
        >
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2 transition-all duration-200 ${
                  isActive
                    ? 'bg-[#303437] rounded-[48px] pl-3 pr-5 py-2.5'
                    : 'p-2'
                }`}
              >
                <item.Icon active={isActive} />
                {isActive && (
                  <span
                    className="text-white whitespace-nowrap"
                    style={{ fontSize: '14px', fontWeight: 500 }}
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
