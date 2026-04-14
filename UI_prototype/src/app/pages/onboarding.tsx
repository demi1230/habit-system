import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Leaf, Clock, Brain, Target, ChevronRight, ChevronLeft } from 'lucide-react';
import { useT } from '../i18n';
import { useGoalTags } from '../store';

export function OnboardingPage() {
  const navigate = useNavigate();
  const t = useT();
  const goalTags = useGoalTags();
  const [step, setStep] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const steps = [
    { icon: Leaf, titleKey: 'onboarding.step1.title', descKey: 'onboarding.step1.desc', color: '#6B9B8A' },
    { icon: Clock, titleKey: 'onboarding.step2.title', descKey: 'onboarding.step2.desc', color: '#C9A86B' },
    { icon: Brain, titleKey: 'onboarding.step3.title', descKey: 'onboarding.step3.desc', color: '#9B6BC9' },
    { icon: Target, titleKey: 'onboarding.step4.title', descKey: 'onboarding.step4.desc', color: '#6BB5C9', isGoalStep: true },
  ];

  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  const toggleGoal = (id: string) => {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-8">
      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {steps.map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all"
            style={{ backgroundColor: i <= step ? 'var(--primary)' : 'var(--muted)' }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
            style={{ backgroundColor: `${current.color}20` }}
          >
            <Icon className="w-8 h-8" style={{ color: current.color }} />
          </div>

          <h2 className="mb-3">{t(current.titleKey)}</h2>
          <p className="text-muted-foreground mb-8">{t(current.descKey)}</p>

          {current.isGoalStep && (
            <div className="grid grid-cols-2 gap-3">
              {goalTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleGoal(tag.id)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    selectedGoals.includes(tag.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card'
                  }`}
                >
                  <span className="text-2xl mb-2 block" style={{ fontSize: '24px' }}>{tag.emoji}</span>
                  <span className={selectedGoals.includes(tag.id) ? 'text-primary' : 'text-foreground'}>
                    {tag.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between mt-8">
        {step > 0 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-1 text-muted-foreground py-3 px-4"
          >
            <ChevronLeft className="w-4 h-4" />
            {t('common.back')}
          </button>
        ) : (
          <div />
        )}

        <button
          onClick={() => {
            if (isLast) {
              navigate('/signup');
            } else {
              setStep(step + 1);
            }
          }}
          className="flex items-center gap-2 bg-primary text-primary-foreground py-3 px-6 rounded-2xl"
        >
          {isLast ? t('common.continue') : t('common.next')}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}