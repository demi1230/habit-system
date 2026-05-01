interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  rounded?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Pulsing placeholder block for loading states.
 * Uses theme variables so it works in both light/dark modes.
 */
export function Skeleton({
  width = '100%',
  height = 14,
  rounded = 8,
  className,
  style,
}: SkeletonProps) {
  return (
    <div
      className={`animate-pulse ${className ?? ''}`}
      style={{
        width,
        height,
        borderRadius: rounded,
        backgroundColor: 'var(--surface-muted)',
        ...style,
      }}
    />
  );
}
