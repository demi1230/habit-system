export function InlineError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div className="inline-error" role="alert"><p>{message}</p>
    {onRetry && <button onClick={onRetry}>Дахин оролдох</button>}
  </div>;
}
