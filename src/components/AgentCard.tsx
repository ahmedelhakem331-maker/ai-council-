'use client';

import { motion } from 'framer-motion';
import {
  agentCardVariants,
  avatarPulseVariants,
  cardEntranceVariants,
  glowPulseVariants,
} from '@/lib/animations';
import { TypingIndicator } from './TypingIndicator';
import { MarkdownCinematic } from './MarkdownCinematic';

interface Agent {
  id: string;
  name: string;
  role: string;
  emoji: string;
  color: string;
}

interface AgentCardProps {
  agent: Agent;
  isActive: boolean;
  isStreaming: boolean;
  content: string;
  tokensUsed?: number;
  latencyMs?: number;
  className?: string;
}

// Color mapping for agent cards
const colorMap: Record<string, { bg: string; border: string; glow: string }> = {
  cyan: {
    bg: 'bg-cyan-950/40',
    border: 'border-cyan-700/50',
    glow: 'shadow-[0_0_20px_rgba(34,211,238,0.15)]',
  },
  violet: {
    bg: 'bg-violet-950/40',
    border: 'border-violet-700/50',
    glow: 'shadow-[0_0_20px_rgba(167,139,250,0.15)]',
  },
  rose: {
    bg: 'bg-rose-950/40',
    border: 'border-rose-700/50',
    glow: 'shadow-[0_0_20px_rgba(244,63,94,0.15)]',
  },
  emerald: {
    bg: 'bg-emerald-950/40',
    border: 'border-emerald-700/50',
    glow: 'shadow-[0_0_20px_rgba(52,211,153,0.15)]',
  },
  amber: {
    bg: 'bg-amber-950/40',
    border: 'border-amber-700/50',
    glow: 'shadow-[0_0_20px_rgba(251,146,60,0.15)]',
  },
};

/**
 * Individual agent card with cinematic animations
 * Shows streaming state, content, and metrics
 */
export function AgentCard({
  agent,
  isActive,
  isStreaming,
  content,
  tokensUsed,
  latencyMs,
  className = '',
}: AgentCardProps) {
  const colors = colorMap[agent.color] || colorMap.cyan;

  return (
    <motion.div
      variants={cardEntranceVariants}
      initial="hidden"
      animate="visible"
      custom={agent.id}
      className={className}
    >
      <motion.div
        variants={agentCardVariants}
        initial={isActive ? 'active' : 'inactive'}
        animate={isActive ? 'active' : 'inactive'}
        whileTap={{ scale: 0.98 }}
        className={`
          relative h-full backdrop-blur-xl rounded-2xl border
          transition-all duration-300
          ${colors.bg} ${colors.border} ${colors.glow}
          overflow-hidden group
        `}
      >
        {/* Background accent glow */}
        {isActive && (
          <motion.div
            variants={glowPulseVariants}
            animate="pulse"
            className="absolute inset-0 opacity-0"
            style={{
              background: `radial-gradient(circle at center, ${
                agent.color === 'cyan'
                  ? 'rgba(34, 211, 238, 0.05)'
                  : agent.color === 'violet'
                    ? 'rgba(167, 139, 250, 0.05)'
                    : agent.color === 'rose'
                      ? 'rgba(244, 63, 94, 0.05)'
                      : agent.color === 'emerald'
                        ? 'rgba(52, 211, 153, 0.05)'
                        : 'rgba(251, 146, 60, 0.05)'
              }, transparent)`,
            }}
          />
        )}

        {/* Content */}
        <div className="relative p-6 h-full flex flex-col">
          {/* Header */}
          <div className="mb-4 pb-4 border-b border-gray-700/50">
            <div className="flex items-center gap-3 mb-2">
              {/* Avatar with pulse */}
              <motion.div
                animate={isActive ? 'animate' : {}}
                variants={avatarPulseVariants}
                className="text-3xl"
              >
                {agent.emoji}
              </motion.div>

              <div className="flex-1">
                <h3 className="font-semibold text-white text-lg">{agent.name}</h3>
                <p className="text-xs text-gray-400">{agent.role}</p>
              </div>

              {/* Status indicator */}
              {isStreaming && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className={`w-2.5 h-2.5 rounded-full ${
                    agent.color === 'cyan'
                      ? 'bg-cyan-400'
                      : agent.color === 'violet'
                        ? 'bg-violet-400'
                        : agent.color === 'rose'
                          ? 'bg-rose-400'
                          : agent.color === 'emerald'
                            ? 'bg-emerald-400'
                            : 'bg-amber-400'
                  }`}
                />
              )}
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {isStreaming ? (
              <TypingIndicator label="Thinking..." color={agent.color} />
            ) : content ? (
              <div className="text-sm text-gray-300 leading-relaxed">
                <MarkdownCinematic content={content} />
              </div>
            ) : (
              <div className="text-xs text-gray-500 italic">Waiting for response...</div>
            )}
          </div>

          {/* Footer metrics */}
          {(tokensUsed !== undefined || latencyMs !== undefined) && (
            <div className="mt-4 pt-4 border-t border-gray-700/50">
              <div className="flex justify-between text-xs text-gray-400">
                {tokensUsed !== undefined && <span>Tokens: {tokensUsed}</span>}
                {latencyMs !== undefined && <span>Latency: {latencyMs}ms</span>}
              </div>
            </div>
          )}
        </div>

        {/* Active indicator edge */}
        {isActive && (
          <motion.div
            layoutId={`border-${agent.id}`}
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              border: '1px solid',
              borderColor:
                agent.color === 'cyan'
                  ? 'rgba(34, 211, 238, 0.5)'
                  : agent.color === 'violet'
                    ? 'rgba(167, 139, 250, 0.5)'
                    : agent.color === 'rose'
                      ? 'rgba(244, 63, 94, 0.5)'
                      : agent.color === 'emerald'
                        ? 'rgba(52, 211, 153, 0.5)'
                        : 'rgba(251, 146, 60, 0.5)',
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
