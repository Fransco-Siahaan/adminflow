import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          ref.current,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
        );
      }, ref);
      return () => ctx.revert();
    }
  }, [location.pathname]);

  return <div ref={ref}>{children}</div>;
}