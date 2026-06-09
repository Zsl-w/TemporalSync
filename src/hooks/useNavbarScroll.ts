import { RefObject } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';

export function useNavbarScroll(navRef: RefObject<HTMLElement>) {
  useGSAP(() => {
    if (!navRef.current) return;

    const nav = navRef.current;

    ScrollTrigger.create({
      start: 'top top',
      end: 99999,
      onUpdate: (self) => {
        const currentScroll = self.scroll();

        if (currentScroll > 10) {
          const isDark = document.documentElement.classList.contains('dark');
          nav.style.backgroundColor = isDark
            ? 'rgba(19, 27, 54, 0.9)'
            : 'rgba(248, 246, 244, 0.9)';
          nav.style.backdropFilter = 'blur(12px)';
          (nav.style as any).WebkitBackdropFilter = 'blur(12px)';
        } else {
          nav.style.backgroundColor = '';
          nav.style.backdropFilter = '';
          (nav.style as any).WebkitBackdropFilter = '';
        }
      },
    });
  }, { scope: navRef });
}
