import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

gsap.config({
  force3D: true,
});

export { gsap, ScrollTrigger, useGSAP };
