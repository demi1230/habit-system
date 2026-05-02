import { useState } from 'react';
import { MapPin, LocateFixed, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { TYPOGRAPHY } from '@/shared/design';

export function LocationSelector() {
  const { currentLat, currentLng, setCurrentLocation } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasLocation = currentLat !== null && currentLng !== null;

  const handleDetect = async () => {
    if (!navigator.geolocation) {
      setError('Таны браузер байршил тодорхойлохыг дэмждэггүй.');
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await setCurrentLocation(pos.coords.latitude, pos.coords.longitude);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError('Байршил авах зөвшөөрөл олдсонгүй. Тохиргооноос зөвшөөр.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  const handleClear = async () => {
    setLoading(true);
    try {
      await setCurrentLocation(null, null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Current state */}
      <div className="flex items-center gap-2 flex-wrap">
        <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
        <span style={TYPOGRAPHY.bodySm} className="text-muted-foreground">
          Одоогийн байршил:
        </span>
        <AnimatePresence mode="wait">
          {hasLocation ? (
            <motion.span
              key="active"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              {currentLat!.toFixed(5)}, {currentLng!.toFixed(5)}
              <button
                disabled={loading}
                onClick={handleClear}
                className="ml-1 opacity-70 hover:opacity-100"
                aria-label="Байршил цэвэрлэх"
              >
              </button>
            </motion.span>
          ) : (
            <motion.span
              key="none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ ...TYPOGRAPHY.bodySm, color: 'var(--muted-foreground)' }}
            >
              тогтоогдоогүй
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Detect button */}
      <button
        onClick={hasLocation ? handleClear : handleDetect}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all w-fit"
        style={{
          background: hasLocation ? 'var(--muted)' : 'var(--primary)',
          color: hasLocation ? 'var(--foreground)' : 'var(--primary-foreground)',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <LocateFixed className="w-4 h-4" />
        )}
        {hasLocation ? 'Байршил арилгах' : 'GPS байршил тогтоох'}
      </button>

      {error && (
        <p style={{ ...TYPOGRAPHY.caption, color: 'var(--destructive)' }}>{error}</p>
      )}

      <p style={{ ...TYPOGRAPHY.caption, color: 'var(--muted-foreground)' }}>
        Байршилтай сануулга таны одоогийн байршлаас 100 м дотор байх үед л явуулна.
      </p>
    </div>
  );
}
