import type { TooltipRenderProps } from 'react-joyride';
import { X } from 'lucide-react';

export function TourTooltip({
  continuous,
  index,
  size,
  step,
  backProps,
  primaryProps,
  skipProps,
  tooltipProps,
}: TooltipRenderProps) {
  return (
    <div
      {...tooltipProps}
      style={{
        backgroundColor: 'var(--card)',
        border: '1px solid var(--surface-border-soft)',
        borderRadius: 20,
        boxShadow: '0 8px 40px rgba(0,0,0,0.22)',
        padding: '20px 20px 16px',
        maxWidth: 280,
        width: 280,
        fontFamily: 'Montserrat, sans-serif',
      }}
    >
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        {step.title && (
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--foreground)', lineHeight: 1.3, flex: 1, paddingRight: 8, margin: 0 }}>
            {step.title as string}
          </p>
        )}
        <button
          {...skipProps}
          id="tour-skip"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            color: 'var(--text-muted-soft)',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
          }}
          title="Алгасах"
        >
          <X size={16} strokeWidth={2} />
        </button>
      </div>

      {/* Body */}
      <p style={{ fontSize: 13, color: 'var(--text-soft)', lineHeight: 1.65, marginBottom: 16, margin: '0 0 16px' }}>
        {step.content as string}
      </p>

      {/* Footer: progress dots + action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 5 }}>
          {Array.from({ length: size }).map((_, i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                width: i === index ? 18 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === index ? 'var(--foreground)' : 'var(--surface-strong)',
                transition: 'width 0.25s ease, background-color 0.25s ease',
              }}
            />
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          {index > 0 && (
            <button
              {...backProps}
              id="tour-back"
              style={{
                background: 'var(--surface-subtle)',
                border: 'none',
                borderRadius: 20,
                padding: '7px 14px',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--foreground)',
                cursor: 'pointer',
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              Буцах
            </button>
          )}
          <button
            {...primaryProps}
            id="tour-next"
            style={{
              background: '#303437',
              border: 'none',
              borderRadius: 20,
              padding: '7px 16px',
              fontSize: 13,
              fontWeight: 600,
              color: '#fff',
              cursor: 'pointer',
              fontFamily: 'Montserrat, sans-serif',
            }}
          >
            {continuous && index < size - 1 ? 'Дараах' : 'Дуусгах'}
          </button>
        </div>
      </div>
    </div>
  );
}
