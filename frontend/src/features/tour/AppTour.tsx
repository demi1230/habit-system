import { Joyride, type EventData, STATUS, EVENTS, ACTIONS } from 'react-joyride';
import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useTour } from '@/context/TourContext';
import { PAGE_TOUR_CONFIG } from './tour-steps';
import { TourTooltip } from './TourTooltip';

/**
 * Renders once inside <BrowserRouter>. Auto-starts the correct tour the first
 * time the user visits each tour-aware page (/dashboard, /create/new, /analytics).
 * Completion is persisted per-page in localStorage via PAGE_TOUR_CONFIG.storageKey.
 * Re-trigger manually: `useTour().startTour()`.
 */
export function AppTour() {
  const { run, stepIndex, startTour, skipTour, finishTour, setStepIndex } = useTour();
  const { pathname } = useLocation();

  // Stop any running tour when navigating between pages
  useEffect(() => {
    skipTour();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Auto-start on first visit to a tour-aware page (skipped when autoStart === false)
  useEffect(() => {
    const config = PAGE_TOUR_CONFIG[pathname];
    if (!config || config.autoStart === false) return;
    if (localStorage.getItem(config.storageKey) === '1') return;
    const timer = setTimeout(startTour, config.delay);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleEvent = useCallback(
    (data: EventData) => {
      const { status, type, action, index } = data;

      if (type === EVENTS.STEP_BEFORE) {
        const target = (data as EventData & { step?: { target?: unknown } }).step?.target;
        if (typeof target === 'string') {
          const el = document.querySelector(target);
          if (el) {
            const rect = el.getBoundingClientRect();
            const top = rect.top + window.scrollY - (window.innerHeight - rect.height) / 2;
            window.scrollTo({ top: Math.max(0, top) });
          }
        }
      }

      if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
        setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
      }

      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        const config = PAGE_TOUR_CONFIG[pathname];
        if (config) localStorage.setItem(config.storageKey, '1');
        status === STATUS.FINISHED ? finishTour() : skipTour();
      }
    },
    // pathname is read inside callback at call time — include for correctness
    [pathname, finishTour, skipTour, setStepIndex],
  );

  const activeConfig = PAGE_TOUR_CONFIG[pathname] ?? null;

  return (
    <Joyride
      steps={activeConfig?.steps ?? []}
      run={run && !!activeConfig}
      stepIndex={stepIndex}
      onEvent={handleEvent}
      continuous
      tooltipComponent={TourTooltip}
      options={{
        zIndex: 10000,
        overlayColor: 'rgba(0, 0, 0, 0.52)',
        spotlightPadding: 8,
        skipBeacon: true,
        overlayClickAction: false,
      }}
    />
  );
}
