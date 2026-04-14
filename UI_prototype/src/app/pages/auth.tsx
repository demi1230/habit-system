import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useT } from '../i18n';

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const t = useT();
  const isLogin = location.pathname === '/login';
  const isForgot = location.pathname === '/forgot';

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  const title = isForgot ? t('auth.resetPassword') : isLogin ? t('auth.welcomeBack') : t('auth.createAccount');
  const subtitle = isForgot
    ? t('auth.resetSub')
    : isLogin
    ? t('auth.loginSub')
    : t('auth.signupSub');

  return (
    <div className="min-h-screen bg-background px-6 py-8 flex flex-col">
      <button onClick={() => navigate(-1)} className="mb-6 self-start">
        <ArrowLeft className="w-5 h-5 text-foreground" />
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1"
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2>{title}</h2>
        </div>
        <p className="text-muted-foreground mb-8">{subtitle}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && !isForgot && (
            <div>
              <label className="block mb-1.5 text-foreground" style={{ fontSize: '14px' }}>{t('auth.fullName')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('auth.yourName')}
                className="w-full px-4 py-3 bg-input-background rounded-xl border border-border focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block mb-1.5 text-foreground" style={{ fontSize: '14px' }}>{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-input-background rounded-xl border border-border focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          {!isForgot && (
            <div>
              <label className="block mb-1.5 text-foreground" style={{ fontSize: '14px' }}>{t('auth.password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-input-background rounded-xl border border-border focus:border-primary focus:outline-none transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {isLogin && (
            <button
              type="button"
              onClick={() => navigate('/forgot')}
              className="text-primary self-end"
              style={{ fontSize: '14px' }}
            >
              {t('auth.forgotPassword')}
            </button>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl mt-4 hover:opacity-90 transition-opacity"
          >
            {isForgot ? t('auth.sendReset') : isLogin ? t('auth.signInBtn') : t('auth.createAccountBtn')}
          </button>
        </form>

        <div className="text-center mt-6">
          {isLogin ? (
            <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
              {t('auth.noAccount')}{' '}
              <button onClick={() => navigate('/signup')} className="text-primary">
                {t('auth.signUp')}
              </button>
            </p>
          ) : !isForgot ? (
            <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
              {t('auth.hasAccount')}{' '}
              <button onClick={() => navigate('/login')} className="text-primary">
                {t('auth.signInLink')}
              </button>
            </p>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}