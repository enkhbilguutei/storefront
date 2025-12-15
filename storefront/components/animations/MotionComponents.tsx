"use client";

import { motion } from "framer-motion";

interface AnimatedListProps {
  children: any;
  className?: string;
  staggerDelay?: number;
}

export function AnimatedList({ children, className, staggerDelay = 0.05 }: AnimatedListProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedListItemProps {
  children: any;
  className?: string;
}

export function AnimatedListItem({ children, className }: AnimatedListItemProps) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.3 }}
      layout
    >
      {children}
    </motion.div>
  );
}

interface FadeInProps {
  children: any;
  className?: string;
  delay?: number;
}

export function FadeIn({ children, className, delay = 0 }: FadeInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      {children}
    </motion.div>
  );
}

interface SlideInProps {
  children: any;
  className?: string;
  direction?: "left" | "right" | "up" | "down";
}

export function SlideIn({ children, className, direction = "up" }: SlideInProps) {
  const directions = {
    left: { x: -20, y: 0 },
    right: { x: 20, y: 0 },
    up: { x: 0, y: 20 },
    down: { x: 0, y: -20 },
  };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...directions[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, ...directions[direction] }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

interface ScaleInProps {
  children: any;
  className?: string;
}

export function ScaleIn({ children, className }: ScaleInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

interface CounterProps {
  value: number;
  className?: string;
}

export function AnimatedCounter({ value, className }: CounterProps) {
  return (
    <motion.span
      key={value}
      className={className}
      initial={{ scale: 1.2, opacity: 0.5 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {value}
    </motion.span>
  );
}

interface PressableProps {
  children: any;
  className?: string;
  onClick?: () => void;
}

export function Pressable({ children, className, onClick }: PressableProps) {
  return (
    <motion.button
      className={className}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.1 }}
    >
      {children}
    </motion.button>
  );
}
