import { useEffect } from 'react';
import { ScrollTrigger } from '../lib/gsap';

export function useScrollRefresh(loading: boolean) {
  useEffect(() => {
    if (!loading) {
      // Recalculate ScrollTrigger positions after async content renders
      ScrollTrigger.refresh();
    }
  }, [loading]);
}
