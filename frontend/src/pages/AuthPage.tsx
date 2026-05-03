import { useState } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/api/auth';
import { TYPOGRAPHY, buttonStyles } from '@/shared/design';
import { CTA_DARK } from '@/lib/habit-colors';

// ─── Error → Mongolian ────────────────────────────────────────────────────────
function toMongolianError(err: unknown, isLogin: boolean): string {
  if (!navigator.onLine) return 'Интернэт холболтоо шалгаад дахин оролдоно уу.';
  const status = (err as { status?: number })?.status;
  const msg = ((err as { message?: string })?.message ?? '').toLowerCase();

  if (isLogin) {
    if (status === 401 || status === 400 ||
        msg.includes('unauthorized') || msg.includes('invalid') ||
        msg.includes('credential') || msg.includes('password') ||
        msg.includes('not found'))
      return 'Имэйл эсвэл нууц үг буруу байна.';
  } else {
    if (status === 409 ||
        msg.includes('already') || msg.includes('exist') ||
        msg.includes('taken') || msg.includes('duplicate') || msg.includes('conflict'))
      return 'Энэ имэйл хаяг аль хэдийн бүртгэлтэй байна.';
    if (msg.includes('password') || msg.includes('weak'))
      return 'Нууц үг хэтэрхий богино байна. 6-с дээш тэмдэгт оруулна уу.';
    if (msg.includes('email') || msg.includes('validation'))
      return 'Имэйл хаягаа зөв оруулна уу.';
    if (status === 400)
      return 'Оруулсан мэдээлэл буруу байна. Дахин шалгана уу.';
  }

  return isLogin
    ? 'Нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу.'
    : 'Бүртгүүлэхэд алдаа гарлаа. Дахин оролдоно уу.';
}

// ─── Reusable styled input ────────────────────────────────────────────────────
function AuthInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: '100%',
        padding: '13px 16px',
        borderRadius: 14,
        backgroundColor: 'var(--card)',
        border: '1.5px solid var(--surface-border-soft)',
        fontSize: 15,
        color: 'var(--foreground)',
        fontFamily: "'Inter', sans-serif",
        outline: 'none',
        transition: 'border-color 0.2s',
        ...props.style,
      }}
      onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; if (props.onFocus) props.onFocus(e); }}
      onBlur={e => { e.currentTarget.style.borderColor = 'var(--surface-border-soft)'; if (props.onBlur) props.onBlur(e); }}
    />
  );
}

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
        // flushSync ensures the auth token is in React state BEFORE the
        // route change, so RequireAuth on the destination page does not
        // bounce us to /welcome based on stale (null) state.
        flushSync(() => {
          login(res.accessToken, res.displayName);
        });
        navigate('/dashboard');
      } else {
        await authApi.register(email, password, name);
        const res = await authApi.login(email, password);
        flushSync(() => {
          login(res.accessToken, res.displayName ?? name);
        });
        navigate('/onboarding');
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(toMongolianError(err, isLogin));
    } finally {
      setLoading(false);
    }
  };

  const title = isLogin ? t('auth.welcomeBack', 'Тавтай морил') : t('auth.createAccount', 'Бүртгүүлэх');
  const subtitle = isLogin
    ? t('auth.loginSub', 'Бүртгэлдээ нэвтрэнэ үү')
    : t('auth.signupSub', 'Шинэ хаяг үүсгэх');

  return (
    <div
      className="min-h-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Top accent */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: '38%',
          backgroundColor: 'var(--muted)',
          borderBottomLeftRadius: 60,
          borderBottomRightRadius: 60,
          zIndex: 0,
        }}
      />

      {/* Back button */}
      <div className="relative z-10 px-5 pt-14 pb-2">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className={buttonStyles({ variant: 'nav', size: 'icon' })}
          style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}
        >
          <ArrowLeft className="w-4 h-4" style={{ color: 'var(--foreground)' }} />
        </motion.button>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 px-6 pt-4 pb-8"
      >
        <h1
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--foreground)',
            marginBottom: 6,
          }}
        >
          {title}
        </h1>
        <p style={{ ...TYPOGRAPHY.bodySm, color: 'var(--text-soft)' }}>{subtitle}</p>
      </motion.div>

      {/* Form card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="relative z-10 flex-1 px-5"
      >
        <div
          className="rounded-3xl p-6 flex flex-col gap-4"
          style={{
            backgroundColor: 'var(--card)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
          }}
        >
          {error && (
            <div
              className="px-4 py-3 rounded-xl text-sm"
              style={{
                backgroundColor: 'rgba(239,68,68,0.09)',
                color: 'var(--destructive, #ef4444)',
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isLogin && (
              <div className="flex flex-col gap-1.5">
                <label style={{ ...TYPOGRAPHY.caption, color: 'var(--foreground)', fontWeight: 500 }}>
                  {t('auth.fullName', 'Нэр')}
                </label>
                <AuthInput
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={t('auth.yourName', 'Таны нэр')}
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label style={{ ...TYPOGRAPHY.caption, color: 'var(--foreground)', fontWeight: 500 }}>
                {t('auth.email', 'Имэйл')}
              </label>
              <AuthInput
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label style={{ ...TYPOGRAPHY.caption, color: 'var(--foreground)', fontWeight: 500 }}>
                {t('auth.password', 'Нууц үг')}
              </label>
              <div className="relative">
                <AuthInput
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  style={{ paddingRight: 48 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted-soft)', lineHeight: 0 }}
                >
                  {showPassword
                    ? <EyeOff className="w-4.5 h-4.5" />
                    : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className={`w-full mt-1 ${buttonStyles({ variant: 'default', size: 'lg' })}`}
              style={{
                backgroundColor: CTA_DARK.bg,
                color: '#fff',
                fontWeight: 600,
                fontSize: 15,
                boxShadow: CTA_DARK.shadow,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? '...'
                : isLogin
                ? t('auth.signInBtn', 'Нэвтрэх')
                : t('auth.createAccountBtn', 'Бүртгүүлэх')}
            </motion.button>
          </form>
        </div>

        {/* Switch link */}
        <div className="text-center mt-5 mb-8">
          {isLogin ? (
            <p style={{ ...TYPOGRAPHY.caption, color: 'var(--text-soft)' }}>
              {t('auth.noAccount', 'Бүртгэл байхгүй юу?')}{' '}
              <button
                onClick={() => navigate('/signup')}
                style={{ color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {t('auth.signUp', 'Бүртгүүлэх')}
              </button>
            </p>
          ) : (
            <p style={{ ...TYPOGRAPHY.caption, color: 'var(--text-soft)' }}>
              {t('auth.hasAccount', 'Бүртгэлтэй юу?')}{' '}
              <button
                onClick={() => navigate('/login')}
                style={{ color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {t('auth.signInLink', 'Нэвтрэх')}
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
