import { RefObject } from 'react';
import { gsap, useGSAP } from '../lib/gsap';

export function useFloatingOrbs(containerRef: RefObject<HTMLElement>) {
  useGSAP(() => {
    if (!containerRef.current) return;
    const orbs = containerRef.current.querySelectorAll('.floating-element');

    orbs.forEach((orb, i) => {
      gsap.to(orb, {
        y: -20 + (i % 2 === 0 ? 40 : -40),
        x: 10 + (i % 3) * 5,
        scale: 1.05,
        duration: 6 + i * 0.5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: i * 0.8,
      });
    });
  }, { scope: containerRef });
}
