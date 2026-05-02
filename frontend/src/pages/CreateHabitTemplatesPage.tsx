import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Plus } from 'lucide-react';
import { TYPOGRAPHY, buttonStyles, SHADOW } from '@/shared/design';
import { getHabitColor } from '@/lib/habit-colors';
import {
  HABIT_TEMPLATE_CATEGORIES,
  HABIT_TEMPLATES,
  type HabitTemplate,
} from '@/features/habits/templates';

function TemplateCard({
  template,
  onClick,
  delay,
}: {
  template: HabitTemplate;
  onClick: () => void;
  delay: number;
}) {
  const color = getHabitColor(template.colorId);
  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="text-left rounded-[18px] p-3.5 flex items-center gap-3"
      style={{ backgroundColor: color.card, boxShadow: SHADOW.card }}
    >
      <div
        className="w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0 text-[22px]"
        style={{ backgroundColor: color.btn }}
      >
        <span>{template.selectedEmoji}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p
          style={{ ...TYPOGRAPHY.cardTitle, fontWeight: 600 }}
          className="truncate text-foreground"
        >
          {template.title}
        </p>
        <p
          style={{ ...TYPOGRAPHY.caption, lineHeight: 1.4, color: 'var(--text-soft)' }}
          className="line-clamp-2 mt-0.5"
        >
          {template.tagline}
        </p>
      </div>
    </motion.button>
  );
}

export function CreateHabitTemplatesPage() {
  const navigate = useNavigate();

  const handlePick = (template: HabitTemplate) => {
    navigate('/create/new', { state: { template } });
  };

  const handleFromScratch = () => {
    navigate('/create/new');
  };

  return (
    <div className="min-h-screen pb-24 overflow-x-hidden bg-background">
      {/* Header */}
      <div
        className="sticky top-0 z-20 bg-background"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}
      >
        <div className="flex items-center justify-between px-5 pt-13 pb-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/dashboard')}
            className={buttonStyles({ variant: 'nav', size: 'icon' })}
            style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
          >
            <ArrowLeft className="w-4 h-4" style={{ color: '#474747' }} />
          </motion.button>
          <p
            style={TYPOGRAPHY.navTitle}
            className="truncate mx-3 flex-1 text-center text-foreground"
          >
            Дадал сонгох
          </p>
          <div className="w-9" />
        </div>
      </div>

      {/* Intro + scratch option */}
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 pt-5"
      >
        <p style={TYPOGRAPHY.pageTitle} className="text-foreground">
          Ямар дадлыг эхлүүлэх вэ?
        </p>
        <p
          style={{ ...TYPOGRAPHY.bodySm, lineHeight: 1.5, marginTop: 6 }}
          className="text-muted-foreground"
        >
          Бэлэн загвараас сонгож засах, эсвэл өөрийн дадлыг үүсгэнэ үү ^^
        </p>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleFromScratch}
          className="mt-4 w-full text-left rounded-[18px] p-4 flex items-center gap-3"
          style={{
            backgroundColor: '#303437',
            boxShadow: '0 4px 14px rgba(48,52,55,0.22)',
          }}
        >
          <div
            className="w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
          >
            <Plus className="w-5 h-5" style={{ color: '#fff' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p
              style={{ ...TYPOGRAPHY.cardTitle, fontWeight: 600, color: '#fff' }}
              className="truncate"
            >
              Өөрөө дадлаа оруулах
            </p>
            <p
              style={{
                ...TYPOGRAPHY.caption,
                color: 'rgba(255,255,255,0.72)',
                marginTop: 2,
              }}
            >
              Шинээр үүсгэх
            </p>
          </div>
        </motion.button>
      </motion.div>

      {/* Categories */}
      <div className="px-5 mt-7 flex flex-col gap-7">
        {HABIT_TEMPLATE_CATEGORIES.map((meta, catIdx) => {
          const templates = HABIT_TEMPLATES.filter((t) => t.category === meta.id);
          if (templates.length === 0) return null;
          return (
            <section key={meta.id}>
              <p
                style={{ ...TYPOGRAPHY.sectionTitle, marginBottom: 2 }}
                className="text-foreground"
              >
                {meta.label}
              </p>
              <p
                style={{ ...TYPOGRAPHY.caption, marginBottom: 12 }}
                className="text-muted-foreground"
              >
                {meta.description}
              </p>
              <div className="flex flex-col gap-2.5">
                {templates.map((template, i) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onClick={() => handlePick(template)}
                    delay={0.02 * (catIdx * 4 + i)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
