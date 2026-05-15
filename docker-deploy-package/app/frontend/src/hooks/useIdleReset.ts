import { useEffect } from 'react';

const EVENTS: Array<keyof WindowEventMap> = ['pointerdown', 'pointermove', 'keydown', 'touchstart'];

export function useIdleReset(onIdle: () => void, timeoutMs = 60000) {
  useEffect(() => {
    let timer = window.setTimeout(onIdle, timeoutMs);

    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(onIdle, timeoutMs);
    };

    EVENTS.forEach((eventName) => window.addEventListener(eventName, reset));

    return () => {
      window.clearTimeout(timer);
      EVENTS.forEach((eventName) => window.removeEventListener(eventName, reset));
    };
  }, [onIdle, timeoutMs]);
}
