import { RefObject } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';

export function useScrollReveal(containerRef: RefObject<HTMLElement>) {
  useGSAP(() => {
    if (!containerRef.current) return;

    const revealElements = containerRef.current.querySelectorAll('[data-scroll-reveal]');

    if (revealElements.length > 0) {
      ScrollTrigger.batch(revealElements as unknown as Element[], {
        onEnter: (elements) => {
          // Animate container to visible
          gsap.to(elements, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power2.out',
            overwrite: true,
          });

          // Stagger-reveal children if specified
          elements.forEach((el) => {
            const stagger = el.getAttribute('data-scroll-reveal-stagger');
            if (stagger && el.children.length > 0) {
              gsap.to(el.children, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: parseFloat(stagger),
                ease: 'power2.out',
                overwrite: true,
              });
            }
          });
        },
        start: 'top 85%',
      });
    }
  }, { scope: containerRef });
}
