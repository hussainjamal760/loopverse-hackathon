'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface ExamSlotLogoProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export function ExamSlotLogo({ size = 48, className = '', animate = true }: ExamSlotLogoProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const checkRef = useRef<SVGPathElement>(null);
  const cellsRef = useRef<SVGRectElement[]>([]);

  useEffect(() => {
    if (!animate || !svgRef.current) return;

    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Animate cells entrance with subtle stagger
      gsap.fromTo(
        cellsRef.current,
        { scale: 0.8, opacity: 0, transformOrigin: 'center center' },
        {
          scale: 1,
          opacity: 1,
          duration: 0.45,
          stagger: 0.06,
          ease: 'power2.out',
        }
      );

      // Animate checkmark path draw-in
      if (checkRef.current) {
        const length = checkRef.current.getTotalLength();
        gsap.set(checkRef.current, {
          strokeDasharray: length,
          strokeDashoffset: length,
          opacity: 0,
        });

        gsap.to(checkRef.current, {
          strokeDashoffset: 0,
          opacity: 1,
          duration: 0.5,
          delay: 0.3,
          ease: 'power2.out',
        });
      }
    }, svgRef);

    return () => ctx.revert();
  }, [animate]);

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block ${className}`}
      aria-label="ExamSlot Brand Mark - Calendar Grid"
      role="img"
    >
      {/* Cell 1: Top Left */}
      <rect
        ref={(el) => {
          if (el) cellsRef.current[0] = el;
        }}
        x="6"
        y="6"
        width="16"
        height="16"
        rx="5"
        fill="#FFFFFF"
        stroke="#7B8578"
        strokeWidth="1.75"
      />
      {/* Subtle date mark inside cell 1 */}
      <circle cx="10.5" cy="10.5" r="1.5" fill="#59645B" opacity="0.6" />

      {/* Cell 2: Top Right */}
      <rect
        ref={(el) => {
          if (el) cellsRef.current[1] = el;
        }}
        x="26"
        y="6"
        width="16"
        height="16"
        rx="5"
        fill="#FFFFFF"
        stroke="#7B8578"
        strokeWidth="1.75"
      />
      <circle cx="30.5" cy="10.5" r="1.5" fill="#59645B" opacity="0.6" />

      {/* Cell 3: Bottom Left */}
      <rect
        ref={(el) => {
          if (el) cellsRef.current[2] = el;
        }}
        x="6"
        y="26"
        width="16"
        height="16"
        rx="5"
        fill="#FFFFFF"
        stroke="#7B8578"
        strokeWidth="1.75"
      />
      <circle cx="10.5" cy="30.5" r="1.5" fill="#59645B" opacity="0.6" />

      {/* Cell 4: Bottom Right (Selected & Checked in Sage & Forest) */}
      <rect
        ref={(el) => {
          if (el) cellsRef.current[3] = el;
        }}
        x="26"
        y="26"
        width="16"
        height="16"
        rx="5"
        fill="#E7EEE3"
        stroke="#285742"
        strokeWidth="2"
      />
      {/* Checkmark in Cell 4 */}
      <path
        ref={checkRef}
        d="M30.5 34.2L33.5 37.2L39 30.8"
        stroke="#285742"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
