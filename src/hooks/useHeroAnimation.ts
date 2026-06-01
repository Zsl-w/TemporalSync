import { RefObject } from 'react';
import { gsap, useGSAP } from '../lib/gsap';

function splitTextToChars(element: HTMLElement): HTMLSpanElement[] {
  const text = element.textContent || '';
  element.textContent = '';
  const chars: HTMLSpanElement[] = [];

  for (const char of text) {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? ' ' : char;
    span.style.display = 'inline-block';
    element.appendChild(span);
    chars.push(span);
  }
  return chars;
}

export function useHeroAnimation(containerRef: RefObject<HTMLElement>) {
  useGSAP(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    const greeting = containerRef.current.querySelector('[data-hero-greeting]');
    if (greeting) {
      tl.from(greeting, { opacity: 0, y: 15, duration: 0.6 });
    }

    const title = containerRef.current.querySelector('[data-hero-title]');
    if (title) {
      const chars = splitTextToChars(title as HTMLElement);
      tl.from(chars, {
        opacity: 0,
        y: 40,
        rotateX: -90,
        stagger: 0.03,
        duration: 0.8,
        ease: 'back.out(1.7)',
      }, '-=0.3');
    }

    const titleEn = containerRef.current.querySelector('[data-hero-title-en]');
    if (titleEn) {
      tl.from(titleEn, { opacity: 0, y: 15, duration: 0.6 }, '-=0.5');
    }

    const subtitle = containerRef.current.querySelector('[data-hero-subtitle]');
    if (subtitle) {
      tl.from(subtitle, { opacity: 0, y: 20, duration: 0.6 }, '-=0.4');
    }

    const bio = containerRef.current.querySelector('[data-hero-bio]');
    if (bio) {
      tl.from(bio, { opacity: 0, y: 20, duration: 0.6 }, '-=0.3');
    }

    const cta = containerRef.current.querySelector('[data-hero-cta]');
    if (cta) {
      tl.from(cta, { opacity: 0, y: 20, duration: 0.5 }, '-=0.2');
    }
  }, { scope: containerRef });
}
