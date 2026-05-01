import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

export function Spinner({ size = 16, color, className }: SpinnerProps) {
  return (
    <Loader2
      className={`animate-spin ${className ?? ''}`}
      style={{ width: size, height: size, color: color ?? 'currentColor' }}
    />
  );
}
