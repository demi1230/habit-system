import { useEffect } from 'react';
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
