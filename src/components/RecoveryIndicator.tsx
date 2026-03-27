'use client';

import { motion } from 'framer-motion';
import { recoveryIndicatorVariants } from '@/lib/animations';
import { useState, useEffect } from 'react';

interface RecoveryIndicatorProps {
  isVisible: boolean;
  fromModel: string;
  toModel: string;
  reason?: string;
  onDismiss?: () => void;
}

/**
 * Visual indicator when model fallback occurs
 * Shows minimal, non-intrusive notification
 */
export function RecoveryIndicator({
  isVisible,
  fromModel,
  toModel,
  reason = 'Model timeout',
  onDismiss,
}: RecoveryIndicatorProps) {
  const [displayTime, setDisplayTime] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setDisplayTime(0);
      return;
    }

    const timer = setTimeout(() => {
      if (onDismiss) {
        onDismiss();
      }
    }, 5000); // Auto-dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, [isVisible, onDismiss]);

  if (!isVisible) return null;

  return (
    <motion.div
      variants={recoveryIndicatorVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed bottom-4 right-4 max-w-sm z-50"
    >
      <div className="backdrop-blur-xl bg-amber-950/70 border border-amber-700/50 rounded-lg px-4 py-3 shadow-xl">
        <div className="flex items-center gap-3">
          {/* Animated lightning icon */}
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-amber-300 text-lg"
          >
            ⚡
          </motion.div>

          <div className="flex-1">
            <div className="text-sm font-semibold text-amber-100">
              Recovering with backup AI...
            </div>
            <div className="text-xs text-amber-300/80 mt-0.5">
              Switched from {fromModel} to {toModel}
            </div>
          </div>

          {/* Dismiss button */}
          <button
            onClick={onDismiss}
            className="text-amber-300/60 hover:text-amber-300 transition-colors"
            aria-label="Dismiss recovery notification"
          >
            ✕
          </button>
        </div>
      </div>
    </motion.div>
  );
}
