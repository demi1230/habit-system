import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useT } from '../i18n';

export function WelcomePage() {
  const navigate = useNavigate();
  const t = useT();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between px-6 py-14"
      style={{ background: 'linear-gradient(160deg, #EEF0FF 0%, #F7FCFF 50%, #E8FFF2 100%)' }}
    >
      <div />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center text-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 rounded-[28px] flex items-center justify-center mb-6"
          style={{ background: 'rgba(99,102,241,0.12)', boxShadow: '0 8px 32px rgba(99,102,241,0.2)' }}
        >
          <span style={{ fontSize: '44px' }}>🌸</span>
        </motion.div>

        <h1
          className="mb-2"
          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '36px', color: '#202325' }}
        >
          Bloom
        </h1>
        <p
          className="max-w-[280px] mb-3"
          style={{ fontSize: '15px', color: 'rgba(0,0,0,0.5)', lineHeight: 1.6 }}
        >
          {t('welcome.tagline')}
        </p>
        <div
          className="px-4 py-1.5 rounded-full"
          style={{ backgroundColor: 'rgba(99,102,241,0.1)', fontSize: '12px', color: '#6366F1', fontWeight: 600 }}
        >
          {t('welcome.motto')} ✨
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="w-full max-w-[340px] flex flex-col gap-3"
      >
        <button
          onClick={() => navigate('/onboarding')}
          className="w-full py-4 rounded-[18px] text-white"
          style={{
            background: '#303437',
            fontSize: '15px',
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(48,52,55,0.25)',
          }}
        >
          {t('welcome.getStarted')}
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-4 rounded-[18px]"
          style={{
            background: 'rgba(99,102,241,0.1)',
            color: '#6366F1',
            fontSize: '15px',
            fontWeight: 600,
          }}
        >
          {t('welcome.signIn')}
        </button>
      </motion.div>
    </div>
  );
}
