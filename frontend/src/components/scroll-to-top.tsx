import { useEffect, type RefObject } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Drop this component anywhere inside <BrowserRouter>.
 * It scrolls `window` to (0, 0) on every route change.
 *
 * Usage:
 *   <ScrollToTop />          // window scroll (default)
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

/**
 * Use this hook when the scrollable surface is a DOM element
 * (e.g. a div with overflow-y-auto) rather than the window itself.
 *
 * Usage:
 *   const ref = useRef<HTMLDivElement>(null);
 *   useScrollContainerToTop(ref);
 *   return <div ref={ref} className="overflow-y-auto h-screen">…</div>
 */
export function useScrollContainerToTop(containerRef: RefObject<HTMLElement | null>) {
  const { pathname } = useLocation();

  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, containerRef]);
}
