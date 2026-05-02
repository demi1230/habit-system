import { useState } from 'react';
import { motion } from 'motion/react';
import { Send } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { appFeedbackApi } from '@/api/app-feedback';
import { Spinner } from '@/components/spinner';
import { BottomSheet } from '@/components/bottom-sheet';
import { TYPOGRAPHY, buttonStyles } from '@/shared/design';

interface FeedbackDialogProps {
  onClose: () => void;
}

export function FeedbackDialog({ onClose }: FeedbackDialogProps) {
  const { userId } = useAuth();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    const trimmed = message.trim();
    if (!trimmed) {
      setError('Санал хүсэлтээ бичнэ үү.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await appFeedbackApi.submit(userId, trimmed);
      setSuccess(true);
      setMessage('');
      setTimeout(onClose, 1800);
    } catch {
      setError('Илгээхэд алдаа гарлаа. Дахин оролдоно уу.');
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
            <Send className="w-5 h-5" style={{ color: '#22c55e' }} />
          </div>
          <p
            style={{ ...TYPOGRAPHY.pageTitle, fontWeight: 500 }}
            className="text-foreground"
          >
            Баярлалаа!
          </p>
          <p
            className="mt-2 text-muted-foreground"
            style={{ ...TYPOGRAPHY.bodySm, lineHeight: 1.6 }}
          >
            Таны санал хүсэлт хүлээн авлаа.
          </p>
        </motion.div>
      ) : (
        <>
          <div className="text-center mb-5">
            <p
              style={{ ...TYPOGRAPHY.pageTitle, fontWeight: 500 }}
              className="text-foreground"
            >
              Санал хүсэлт
            </p>
            <p
              className="mt-2 text-muted-foreground"
              style={{ ...TYPOGRAPHY.bodySm, lineHeight: 1.6 }}
            >
              Аппыг сайжруулахад туслаж санал хүсэлтээ илгээж байгаад баярлалаа.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Таны санал, сэтгэгдэл, тохирсон алдааны тайлбар..."
              maxLength={2000}
              rows={5}
              disabled={loading}
              autoFocus
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 14,
                backgroundColor: 'var(--surface-muted)',
                border: '1.5px solid var(--surface-border-soft)',
                fontSize: 14,
                color: 'var(--foreground)',
                fontFamily: "'Inter', sans-serif",
                outline: 'none',
                resize: 'none',
                lineHeight: 1.55,
              }}
            />

            {error ? (
              <p style={{ ...TYPOGRAPHY.caption, color: 'var(--destructive, #ef4444)' }}>
                {error}
              </p>
            ) : null}

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
                {loading ? <Spinner size={14} /> : <Send className="w-3.5 h-3.5" />}
                {loading ? 'Илгээж байна…' : 'Илгээх'}
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
