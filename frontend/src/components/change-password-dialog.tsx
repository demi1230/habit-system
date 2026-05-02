import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/api/auth';
import { Spinner } from '@/components/spinner';
import { BottomSheet } from '@/components/bottom-sheet';
import { TYPOGRAPHY, buttonStyles } from '@/shared/design';

interface PasswordScore {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: string;
}

function scorePassword(value: string): PasswordScore {
  if (!value) return { score: 0, label: '', color: 'transparent' };

  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;

  const capped = Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;

  if (capped <= 1) return { score: 1, label: 'Сул', color: '#ef4444' };
  if (capped === 2) return { score: 2, label: 'Дунд зэрэг', color: '#f59e0b' };
  if (capped === 3) return { score: 3, label: 'Сайн', color: '#3b82f6' };
  return { score: 4, label: 'Маш сайн', color: '#22c55e' };
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 40px 11px 14px',
  borderRadius: 12,
  backgroundColor: 'var(--surface-muted)',
  border: '1.5px solid var(--surface-border-soft)',
  fontSize: 14,
  color: 'var(--foreground)',
  fontFamily: "'Inter', sans-serif",
  outline: 'none',
};

interface ChangePasswordDialogProps {
  onClose: () => void;
}

export function ChangePasswordDialog({ onClose }: ChangePasswordDialogProps) {
  const { userId } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const passwordScore = useMemo(() => scorePassword(next), [next]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setError('');
    if (next.length < 8) {
      setError('Нууц үг хамгийн багадаа 8 тэмдэгт байна.');
      return;
    }
    if (next === current) {
      setError('Шинэ нууц үг хуучин нууц үгнээс өөр байх ёстой.');
      return;
    }
    if (next !== confirm) {
      setError('Шинэ нууц үг таарахгүй байна.');
      return;
    }
    setLoading(true);
    try {
      await authApi.changePassword(userId, current, next);
      setSuccess(true);
      setCurrent('');
      setNext('');
      setConfirm('');
      setTimeout(onClose, 1800);
    } catch (err) {
      setError((err as Error)?.message || 'Нууц үг солиход алдаа гарлаа.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet onClose={onClose} busy={loading}>
      {success ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-6"
        >
          <div
            className="mx-auto mb-3 w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#22c55e22' }}
          >
            <KeyRound className="w-5 h-5" style={{ color: '#22c55e' }} />
          </div>
          <p
            style={{ ...TYPOGRAPHY.pageTitle, fontWeight: 500 }}
            className="text-foreground"
          >
            Нууц үг шинэчлэгдлээ
          </p>
          <p
            className="mt-2 text-muted-foreground"
            style={{ ...TYPOGRAPHY.bodySm, lineHeight: 1.6 }}
          >
            Шинэ нууц үг амжилттай хадгалагдлаа.
          </p>
        </motion.div>
      ) : (
        <>
          <div className="text-center mb-5">
            <p
              style={{ ...TYPOGRAPHY.pageTitle, fontWeight: 500 }}
              className="text-foreground"
            >
              Нууц үг солих
            </p>
            <p
              className="mt-2 text-muted-foreground"
              style={{ ...TYPOGRAPHY.bodySm, lineHeight: 1.6 }}
            >
              Хуучин нууц үгээ баталгаажуулаад шинэ нууц үгээ оруулна уу.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {error ? (
              <p style={{ ...TYPOGRAPHY.caption, color: 'var(--destructive, #ef4444)' }}>
                {error}
              </p>
            ) : null}

            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="Одоогийн нууц үг"
                aria-label="Одоогийн нууц үг"
                required
                autoComplete="current-password"
                disabled={loading}
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                aria-label={showCurrent ? 'Нууц үгийг далдлах' : 'Нууц үгийг харуулах'}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted-soft)', lineHeight: 0 }}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={next}
                onChange={(e) => setNext(e.target.value)}
                placeholder="Шинэ нууц үг (8+ тэмдэгт)"
                aria-label="Шинэ нууц үг"
                required
                autoComplete="new-password"
                disabled={loading}
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                aria-label={showNew ? 'Нууц үгийг далдлах' : 'Нууц үгийг харуулах'}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted-soft)', lineHeight: 0 }}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {next ? (
              <div className="flex items-center gap-2">
                <div className="flex-1 flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className="flex-1 rounded-full transition-colors duration-150"
                      style={{
                        height: 4,
                        backgroundColor:
                          level <= passwordScore.score
                            ? passwordScore.color
                            : 'var(--surface-strong)',
                      }}
                    />
                  ))}
                </div>
                <span
                  style={{
                    ...TYPOGRAPHY.micro,
                    color: passwordScore.color,
                    minWidth: 70,
                    textAlign: 'right',
                  }}
                >
                  {passwordScore.label}
                </span>
              </div>
            ) : null}

            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Шинэ нууц үгийг давтах"
                aria-label="Шинэ нууц үгийг давтах"
                required
                autoComplete="new-password"
                disabled={loading}
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? 'Нууц үгийг далдлах' : 'Нууц үгийг харуулах'}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted-soft)', lineHeight: 0 }}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex flex-col gap-2.5 mt-1">
              <motion.button
                whileTap={loading ? undefined : { scale: 0.97 }}
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 w-full rounded-full px-6 py-3.5 border-none outline-none"
                style={{
                  backgroundColor: 'var(--foreground)',
                  color: 'var(--background)',
                  fontSize: 15,
                  fontWeight: 500,
                  opacity: loading ? 0.6 : 1,
                  boxShadow: '0 4px 14px rgba(48,52,55,0.28)',
                }}
              >
                {loading ? <Spinner size={14} /> : null}
                {loading ? 'Хадгалж байна…' : 'Хадгалах'}
              </motion.button>
              <motion.button
                whileTap={loading ? undefined : { scale: 0.97 }}
                type="button"
                onClick={onClose}
                disabled={loading}
                className={`w-full ${buttonStyles({ variant: 'secondary', size: 'lg' })}`}
                style={{
                  backgroundColor: 'var(--surface-subtle)',
                  color: 'var(--foreground)',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                Болих
              </motion.button>
            </div>
          </form>
        </>
      )}
    </BottomSheet>
  );
}
