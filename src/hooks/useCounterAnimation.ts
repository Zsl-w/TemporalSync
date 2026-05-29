import { RefObject } from 'react';
import { gsap, useGSAP } from '../lib/gsap';

export function useCounterAnimation(containerRef: RefObject<HTMLElement>) {
  useGSAP(() => {
    if (!containerRef.current) return;

    const counters = containerRef.current.querySelectorAll('[data-counter]');

    counters.forEach((el) => {
      const target = parseInt(el.getAttribute('data-counter') || '0', 10);
      const suffix = el.getAttribute('data-counter-suffix') || '';
      const obj = { value: 0 };

      gsap.to(obj, {
        value: target,
        duration: 1.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        onUpdate: () => {
          el.textContent = Math.round(obj.value).toLocaleString() + suffix;
        },
      });
    });
  }, { scope: containerRef });
}
