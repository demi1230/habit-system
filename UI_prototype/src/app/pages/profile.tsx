import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { BottomNav } from '../components/bottom-nav';
import { User, Bell, Shield, Settings, ChevronRight, LogOut, Globe, Sun, Moon, Monitor, Palette, Tag, Plus, X } from 'lucide-react';
import { useT } from '../i18n';
import { useLang, setLang, type Lang } from '../i18n';
import { useTheme, setTheme, type ThemeMode } from '../theme-store';
import { useGoalTags, addGoalTag, removeGoalTag, type GoalTag } from '../store';
import { useState } from 'react';

const emojiOptions = ['🎯', '🌟', '💪', '🧠', '🎨', '🌱', '🔥', '💎', '🎵', '📝', '🏠', '🤝', '💰', '🌍', '❤️', '🧘'];
const colorOptions = ['#6BB5C9', '#C9A86B', '#C96B6B', '#9B6BC9', '#6BC98A', '#E8A96B', '#C96BA8', '#8BC96B', '#6B8EC9', '#C9C96B'];

export function ProfilePage() {
  const navigate = useNavigate();
  const t = useT();
  const lang = useLang();
  const theme = useTheme();
  const goalTags = useGoalTags();
  const [showCreateTag, setShowCreateTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagEmoji, setNewTagEmoji] = useState('🎯');
  const [newTagColor, setNewTagColor] = useState('#6BB5C9');

  const menuItems = [
    { icon: Bell, labelKey: 'profile.notifications', path: '/reminders' },
    { icon: Shield, labelKey: 'profile.privacy', path: null },
    { icon: Settings, labelKey: 'profile.appPrefs', path: null },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-12 pb-4">
        <h2 className="mb-6">{t('profile.title')}</h2>

        {/* User Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-5 border border-border flex items-center gap-4 mb-6"
        >
          <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h3>Alex Johnson</h3>
            <p className="text-muted-foreground" style={{ fontSize: '14px' }}>alex@example.com</p>
            <p className="text-primary mt-1" style={{ fontSize: '12px' }}>{t('profile.memberSince')}</p>
          </div>
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          <div className="bg-card rounded-2xl p-3 border border-border text-center">
            <p className="text-primary" style={{ fontSize: '22px' }}>4</p>
            <p className="text-muted-foreground" style={{ fontSize: '11px' }}>{t('common.active')}</p>
          </div>
          <div className="bg-card rounded-2xl p-3 border border-border text-center">
            <p style={{ fontSize: '22px' }}>1</p>
            <p className="text-muted-foreground" style={{ fontSize: '11px' }}>{t('profile.archived')}</p>
          </div>
          <div className="bg-card rounded-2xl p-3 border border-border text-center">
            <p style={{ fontSize: '22px' }}>42</p>
            <p className="text-muted-foreground" style={{ fontSize: '11px' }}>{t('profile.totalLogs')}</p>
          </div>
        </motion.div>

        {/* Language Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-2xl border border-border p-4 mb-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <Globe className="w-5 h-5 text-primary" />
            <span>{t('profile.language')}</span>
          </div>
          <div className="flex gap-2">
            {([
              { id: 'en' as Lang, label: 'English', flag: '🇺🇸' },
              { id: 'mn' as Lang, label: 'Монгол', flag: '🇲🇳' },
            ]).map((option) => (
              <button
                key={option.id}
                onClick={() => setLang(option.id)}
                className={`flex-1 py-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
                  lang === option.id
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border bg-background text-muted-foreground'
                }`}
                style={{ fontSize: '14px' }}
              >
                <span style={{ fontSize: '18px' }}>{option.flag}</span>
                {option.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Theme Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="bg-card rounded-2xl border border-border p-4 mb-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <Palette className="w-5 h-5 text-primary" />
            <span>{t('theme.title')}</span>
          </div>
          <div className="flex gap-2">
            {([
              { id: 'light' as ThemeMode, label: t('theme.light'), icon: Sun },
              { id: 'dark' as ThemeMode, label: t('theme.dark'), icon: Moon },
              { id: 'system' as ThemeMode, label: t('theme.system'), icon: Monitor },
            ]).map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => setTheme(option.id)}
                  className={`flex-1 py-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all ${
                    theme === option.id
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border bg-background text-muted-foreground'
                  }`}
                  style={{ fontSize: '13px' }}
                >
                  <Icon className="w-4.5 h-4.5" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Goal Tag Management */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.19 }}
          className="bg-card rounded-2xl border border-border p-4 mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Tag className="w-5 h-5 text-primary" />
              <span>{t('goalTag.manage')}</span>
            </div>
            <button
              onClick={() => setShowCreateTag(true)}
              className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <Plus className="w-4 h-4 text-primary" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {goalTags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-background"
                style={{ fontSize: '13px' }}
              >
                <span style={{ fontSize: '14px' }}>{tag.emoji}</span>
                <span>{tag.name}</span>
                {!tag.isSystem && (
                  <button
                    onClick={() => removeGoalTag(tag.id)}
                    className="ml-0.5 w-4 h-4 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Create Tag Modal */}
          <AnimatePresence>
            {showCreateTag && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="mb-3" style={{ fontSize: '14px' }}>{t('goalTag.newTag')}</p>
                  <input
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder={t('goalTag.tagNamePh')}
                    className="w-full px-4 py-3 bg-input-background rounded-xl border border-border focus:border-primary focus:outline-none mb-3"
                    style={{ fontSize: '14px' }}
                  />
                  <p className="text-muted-foreground mb-2" style={{ fontSize: '12px' }}>{t('goalTag.chooseEmoji')}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {emojiOptions.map((em) => (
                      <button
                        key={em}
                        onClick={() => setNewTagEmoji(em)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${
                          newTagEmoji === em ? 'border-primary bg-primary/5' : 'border-border bg-background'
                        }`}
                        style={{ fontSize: '18px' }}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-2" style={{ fontSize: '12px' }}>{t('goalTag.chooseColor')}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {colorOptions.map((c) => (
                      <button
                        key={c}
                        onClick={() => setNewTagColor(c)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          newTagColor === c ? 'border-foreground scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (newTagName.trim()) {
                          addGoalTag({
                            id: `custom-${Date.now()}`,
                            name: newTagName.trim(),
                            emoji: newTagEmoji,
                            color: newTagColor,
                            isSystem: false,
                          });
                          setNewTagName('');
                          setNewTagEmoji('🎯');
                          setNewTagColor('#6BB5C9');
                          setShowCreateTag(false);
                        }
                      }}
                      className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl"
                      style={{ fontSize: '14px' }}
                    >
                      {t('goalTag.create')}
                    </button>
                    <button
                      onClick={() => setShowCreateTag(false)}
                      className="px-4 py-2.5 bg-secondary text-secondary-foreground rounded-xl"
                      style={{ fontSize: '14px' }}
                    >
                      {t('common.cancel')}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Menu */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl border border-border overflow-hidden mb-6"
        >
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={item.labelKey}
                onClick={() => item.path && navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-4 hover:bg-secondary/50 transition-colors ${
                  i < menuItems.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <Icon className="w-5 h-5 text-primary" />
                <span className="flex-1 text-left">{t(item.labelKey)}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            );
          })}
        </motion.div>

        {/* Log out */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-4 bg-card rounded-2xl border border-border text-destructive hover:bg-destructive/5 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>{t('profile.signOut')}</span>
          </button>
        </motion.div>

        {/* App info */}
        <div className="text-center mt-8">
          <p className="text-muted-foreground" style={{ fontSize: '12px' }}>Bloom v1.0</p>
          <p className="text-muted-foreground" style={{ fontSize: '11px' }}>{t('profile.builtWith')} 🌱</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}