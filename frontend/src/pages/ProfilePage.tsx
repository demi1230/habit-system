import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeft, User, ChevronRight, LogOut, Moon, Sun, Monitor,
  Globe, Bell, Shield, HelpCircle, Info,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { habitsApi } from '@/api/habits';
import { useLang, setLang, type LangKey } from '@/lib/i18n';
import { useTheme, setTheme, type ThemeKey } from '@/lib/theme-store';
import type { Habit } from '@/api/types';

const THEME_OPTIONS: { key: ThemeKey; label: string; icon: React.ReactNode }[] = [
  { key: 'light',  label: 'Цайвар', icon: <Sun className="w-3.5 h-3.5" /> },
  { key: 'dark',   label: 'Бараан', icon: <Moon className="w-3.5 h-3.5" /> },
  { key: 'system', label: 'Систем', icon: <Monitor className="w-3.5 h-3.5" /> },
];

const LANG_OPTIONS: { key: LangKey; label: string; flag: string }[] = [
  { key: 'mn', label: 'Монгол', flag: '🇲🇳' },
  { key: 'en', label: 'English', flag: '🇺🇸' },
];

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[20px] bg-card overflow-hidden"
      style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>{children}</div>
  );
}

function MenuItem({ icon, label, value, onClick, danger }: {
  icon: React.ReactNode; label: string; value?: string; onClick?: () => void; danger?: boolean;
}) {
  return (
    <motion.button whileTap={{ scale: 0.98 }} onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
      <div className="w-8 h-8 rounded-[12px] flex items-center justify-center shrink-0"
        style={{ backgroundColor: danger ? '#ef444415' : 'rgba(0,0,0,0.05)' }}>
        {icon}
      </div>
      <span className="flex-1 text-foreground"
        style={{ fontSize: 14, fontWeight: 500, color: danger ? '#ef4444' : undefined }}>{label}</span>
      {value && (
        <span className="text-muted-foreground" style={{ fontSize: 12 }}>{value}</span>
      )}
      {onClick && !danger && <ChevronRight className="w-4 h-4" style={{ color: 'rgba(0,0,0,0.2)' }} />}
    </motion.button>
  );
}

function Divider() {
  return <div style={{ height: 0.5, backgroundColor: 'rgba(0,0,0,0.07)', marginLeft: 60 }} />;
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { userId, displayName, logout } = useAuth();
  const theme = useTheme();
  const lang = useLang();
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    if (!userId) return;
    habitsApi.list(userId).then(setHabits).catch(console.error);
  }, [userId]);

  const activeCount = habits.filter(h => h.status === 'ACTIVE').length;
  const archivedCount = habits.filter(h => h.status === 'ARCHIVED').length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* HEADER */}
      <div className="sticky top-0 z-20 bg-background" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="flex items-center gap-3 px-5 pt-13 pb-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
            <ArrowLeft className="w-4 h-4" style={{ color: '#474747' }} />
          </motion.button>
          <p style={{ fontSize: 17, fontWeight: 700 }} className="text-foreground">Профайл</p>
        </div>
      </div>

      <div className="px-5 pt-5 flex flex-col gap-5">
        {/* USER CARD */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-[24px] p-5 text-center"
          style={{ background: 'linear-gradient(135deg, #C8B6FF 0%, #E8C1E8 50%, #FFD6A5 100%)', boxShadow: '0 2px 16px rgba(0,0,0,0.09)' }}>
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-3"
            style={{ backgroundColor: 'rgba(255,255,255,0.55)' }}>
            <User className="w-8 h-8" style={{ color: '#6C5CE7' }} />
          </div>
          <p style={{ fontSize: 20, fontWeight: 800, color: '#202325' }}>{displayName || 'Хэрэглэгч'}</p>
          <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', marginTop: 4 }}>ID: {userId?.slice(0, 8)}...</p>
          <div className="flex justify-center gap-6 mt-4">
            <div className="text-center">
              <p style={{ fontSize: 22, fontWeight: 800, color: '#202325' }}>{activeCount}</p>
              <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)', fontWeight: 500 }}>Идэвхтэй</p>
            </div>
            <div style={{ width: 1, backgroundColor: 'rgba(0,0,0,0.12)' }} />
            <div className="text-center">
              <p style={{ fontSize: 22, fontWeight: 800, color: '#202325' }}>{archivedCount}</p>
              <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)', fontWeight: 500 }}>Архив</p>
            </div>
            <div style={{ width: 1, backgroundColor: 'rgba(0,0,0,0.12)' }} />
            <div className="text-center">
              <p style={{ fontSize: 22, fontWeight: 800, color: '#202325' }}>{habits.length}</p>
              <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)', fontWeight: 500 }}>Нийт</p>
            </div>
          </div>
        </motion.div>

        {/* THEME SWITCHER */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}
            className="text-muted-foreground mb-2 pl-0.5">ХАРАГДАЦ</p>
          <Card>
            <div className="p-3 flex gap-2">
              {THEME_OPTIONS.map(opt => {
                const active = theme === opt.key;
                return (
                  <motion.button key={opt.key} whileTap={{ scale: 0.95 }}
                    onClick={() => setTheme(opt.key)}
                    className="flex-1 py-2.5 rounded-[14px] flex items-center justify-center gap-1.5"
                    style={{
                      backgroundColor: active ? '#6C5CE7' + '20' : 'rgba(0,0,0,0.05)',
                      border: active ? '1.5px solid #6C5CE744' : '1.5px solid transparent',
                      color: active ? '#6C5CE7' : 'rgba(0,0,0,0.5)',
                      fontSize: 12, fontWeight: active ? 700 : 500,
                    }}>
                    {opt.icon}
                    {opt.label}
                  </motion.button>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* LANGUAGE */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}
            className="text-muted-foreground mb-2 pl-0.5">ХЭЛ</p>
          <Card>
            <div className="p-3 flex gap-2">
              {LANG_OPTIONS.map(opt => {
                const active = lang === opt.key;
                return (
                  <motion.button key={opt.key} whileTap={{ scale: 0.95 }}
                    onClick={() => setLang(opt.key)}
                    className="flex-1 py-2.5 rounded-[14px] flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: active ? '#6C5CE7' + '20' : 'rgba(0,0,0,0.05)',
                      border: active ? '1.5px solid #6C5CE744' : '1.5px solid transparent',
                      color: active ? '#6C5CE7' : 'rgba(0,0,0,0.5)',
                      fontSize: 13, fontWeight: active ? 700 : 500,
                    }}>
                    <span>{opt.flag}</span>
                    {opt.label}
                  </motion.button>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* MENU */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.10 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}
            className="text-muted-foreground mb-2 pl-0.5">ЦЭС</p>
          <Card>
            <MenuItem icon={<Bell className="w-4 h-4 text-muted-foreground" />}
              label="Мэдэгдэл" onClick={() => navigate('/reminders')} />
            <Divider />
            <MenuItem icon={<Shield className="w-4 h-4 text-muted-foreground" />}
              label="Нууцлал" />
            <Divider />
            <MenuItem icon={<HelpCircle className="w-4 h-4 text-muted-foreground" />}
              label="Тусламж" />
            <Divider />
            <MenuItem icon={<Info className="w-4 h-4 text-muted-foreground" />}
              label="Хувилбар" value="v1.0.0" />
            <Divider />
            <MenuItem icon={<LogOut className="w-4 h-4" style={{ color: '#ef4444' }} />}
              label="Гарах" onClick={handleLogout} danger />
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
