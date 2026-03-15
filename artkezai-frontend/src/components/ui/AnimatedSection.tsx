'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'left' | 'right';
}

export default function AnimatedSection({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}: AnimatedSectionProps) {
  const ref = useRef(null);
  const inView = useInView(ref, {
    once: true,
    margin: '-80px',
  });

  const getInitialValues = () => {
    switch (direction) {
      case 'left':
        return { opacity: 0, x: -32 };
      case 'right':
        return { opacity: 0, x: 32 };
      case 'up':
      default:
        return { opacity: 0, y: 32 };
    }
  };

  const getAnimateValues = () => {
    switch (direction) {
      case 'left':
      case 'right':
        return { opacity: 1, x: 0 };
      case 'up':
      default:
        return { opacity: 1, y: 0 };
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={getInitialValues()}
      animate={inView ? getAnimateValues() : getInitialValues()}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
