'use client';

import { motion } from 'framer-motion';
import { sentenceVariants, containerVariants } from '@/lib/animations';
import { useEffect, useState } from 'react';

interface SmoothRevealTextProps {
  content: string;
  className?: string;
  role?: string;
}

/**
 * Sentence-by-sentence text reveal with smooth fade-in
 * Splits content into sentences and reveals each with 50ms stagger
 */
export function SmoothRevealText({
  content,
  className = '',
  role = 'status',
}: SmoothRevealTextProps) {
  const [sentences, setSentences] = useState<string[]>([]);

  useEffect(() => {
    // Split by sentence boundaries (., !, ?, followed by space or end)
    const sentenceRegex = /[^.!?]*[.!?]+/g;
    const matches = content.match(sentenceRegex) || [];

    // Clean up sentences (trim whitespace)
    const cleanedSentences = matches
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // If no sentences found, treat entire content as one
    if (cleanedSentences.length === 0 && content.length > 0) {
      setSentences([content]);
    } else {
      setSentences(cleanedSentences);
    }
  }, [content]);

  if (sentences.length === 0) {
    return null;
  }

  return (
    <motion.div
      role={role}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {sentences.map((sentence, i) => (
        <motion.span
          key={`${i}-${sentence.substring(0, 10)}`}
          custom={i}
          variants={sentenceVariants}
          className="inline"
        >
          {sentence}{' '}
        </motion.span>
      ))}
    </motion.div>
  );
}
