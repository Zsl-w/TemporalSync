import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from '../lib/gsap';

export function usePageTransition() {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if (prevPath.current === location.pathname) return;
    prevPath.current = location.pathname;

    if (!mainRef.current) return;

    // Only subtle y-shift, no opacity change to avoid white flash
    gsap.fromTo(mainRef.current,
      { y: 6 },
      { y: 0, duration: 0.35, ease: 'power2.out' }
    );

    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return mainRef;
}
