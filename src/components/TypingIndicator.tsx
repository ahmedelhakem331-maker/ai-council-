'use client';

import { motion } from 'framer-motion';
import { typingIndicatorVariants } from '@/lib/animations';

interface TypingIndicatorProps {
  label?: string;
  color?: string;
}

/**
 * Animated typing indicator with three bouncing dots
 */
export function TypingIndicator({ label = 'Thinking...', color = 'cyan' }: TypingIndicatorProps) {
  const colorClasses: Record<string, string> = {
    cyan: 'bg-cyan-400',
    violet: 'bg-violet-400',
    rose: 'bg-rose-400',
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
  };

  const bgColor = colorClasses[color] || colorClasses.cyan;

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            custom={i}
            variants={typingIndicatorVariants}
            animate="animate"
            className={`w-2 h-2 rounded-full ${bgColor}`}
          />
        ))}
      </div>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
}
