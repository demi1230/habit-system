import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/api/auth';

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const t = useT();
  const { login } = useAuth();
  const isLogin = location.pathname === '/login';

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const res = await authApi.login(email, password);
        login(res.accessToken);
        navigate('/dashboard');
      } else {
        await authApi.register(email, password, name);
        const res = await authApi.login(email, password);
        login(res.accessToken, name);
        navigate('/dashboard');
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.message || (isLogin ? t('auth.loginError', 'Нэвтрэхэд алдаа гарлаа') : t('auth.signupError', 'Бүртгүүлэхэд алдаа гарлаа')));
    } finally {
      setLoading(false);
    }
  };

  const title = isLogin ? t('auth.welcomeBack', 'Тавтай морил') : t('auth.createAccount', 'Бүртгүүлэх');
  const subtitle = isLogin
    ? t('auth.loginSub', 'Бүртгэлдээ нэвтрэнэ үү')
    : t('auth.signupSub', 'Шинэ хаяг үүсгэх');

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

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <div>
              <label className="block mb-1.5 text-foreground" style={{ fontSize: '14px' }}>{t('auth.fullName', 'Нэр')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('auth.yourName', 'Таны нэр')}
                className="w-full px-4 py-3 bg-card rounded-xl border border-border focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block mb-1.5 text-foreground" style={{ fontSize: '14px' }}>{t('auth.email', 'Имэйл')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 bg-card rounded-xl border border-border focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block mb-1.5 text-foreground" style={{ fontSize: '14px' }}>{t('auth.password', 'Нууц үг')}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-card rounded-xl border border-border focus:border-primary focus:outline-none transition-colors pr-12"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl mt-4 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading
              ? '...'
              : isLogin
              ? t('auth.signInBtn', 'Нэвтрэх')
              : t('auth.createAccountBtn', 'Бүртгүүлэх')}
          </button>
        </form>

        <div className="text-center mt-6">
          {isLogin ? (
            <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
              {t('auth.noAccount', 'Бүртгэл байхгүй юу?')}{' '}
              <button onClick={() => navigate('/signup')} className="text-primary">
                {t('auth.signUp', 'Бүртгүүлэх')}
              </button>
            </p>
          ) : (
            <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
              {t('auth.hasAccount', 'Бүртгэлтэй юу?')}{' '}
              <button onClick={() => navigate('/login')} className="text-primary">
                {t('auth.signInLink', 'Нэвтрэх')}
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
