'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSmartStream } from '@/hooks/useSmartStream';
import { useBoardController } from './AgentBoardroom';
import { AgentBoardroom } from './AgentBoardroom';
import { RecoveryIndicator } from './RecoveryIndicator';
import { pageEntranceVariants, scaleBounceVariants } from '@/lib/animations';
import { useLocalStorage, storage } from '@/lib/localStorage';

interface Agent {
  id: string;
  name: string;
  role: string;
  emoji: string;
  color: string;
}

interface ChatInterfaceProps {
  agents: Agent[];
  className?: string;
}

/**
 * Main Chat Interface Component
 * Orchestrates WebSocket streaming, board state, and UI rendering
 */
export function ChatInterface({ agents, className = '' }: ChatInterfaceProps) {
  const [idea, setIdea] = useState('');
  const [language, setLanguage] = useLocalStorage<string>('language', 'en', {
    namespace: 'ai_council',
  });
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Streaming hook
  const { state: streamState, sendMessage, resume, clearError, subscribe } = useSmartStream();

  // Board controller
  const board = useBoardController();

  // Recovery tracking
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryInfo, setRecoveryInfo] = useState<{
    from: string;
    to: string;
  } | null>(null);

  // Subscribe to WebSocket messages
  useEffect(() => {
    return subscribe((message) => {
      switch (message.type) {
        case 'agent_start': {
          const agent = agents.find((a) => a.id === message.agent?.id);
          if (agent) {
            board.setActiveAgent(agent.id);
          }
          break;
        }

        case 'token': {
          if (message.agent?.id && message.content) {
            board.addStreamContent(message.agent.id, message.content);
          }
          break;
        }

        case 'agent_complete': {
          board.completeAgent(
            message.agent_id || '',
            message.tokens_used || 0,
            message.latency_ms || 0
          );
          break;
        }

        case 'recovery_start': {
          setRecoveryInfo({
            from: message.from_model || 'Primary Model',
            to: message.to_model || 'Fallback Model',
          });
          setShowRecovery(true);
          break;
        }

        case 'session_complete': {
          board.completeSession();
          // Save to localStorage
          const sessionData = {
            idea,
            timestamp: new Date().toISOString(),
            agents: board.state.agents,
            traceId: board.state.traceId,
          };
          storage.set(`session_${board.state.sessionId}`, sessionData, {
            namespace: 'ai_council_sessions',
          });
          break;
        }

        case 'error': {
          console.error('[Chat Error]', message.message);
          break;
        }
      }
    });
  }, [subscribe, board, agents, idea, language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idea.trim() || !streamState.isConnected) {
      alert('Please enter an idea and ensure connection is active');
      return;
    }

    board.reset();
    board.startSession(`session_${Date.now()}`, `trace_${Math.random()}`);
    sendMessage(idea, language);

    // Clear input
    setIdea('');
  };

  const isLoading = streamState.isStreaming;
  const hasError = !!streamState.error;

  return (
    <motion.div
      variants={pageEntranceVariants}
      initial="hidden"
      animate="visible"
      className={`min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 ${className}`}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-violet-400 to-amber-400 bg-clip-text text-transparent">
            🏛️ AI Council
          </h1>
          <div className="flex items-center gap-3">
            {/* Connection status */}
            <div className="flex items-center gap-2 text-sm">
              <motion.div
                animate={{
                  scale: streamState.isConnected ? [1, 1.2, 1] : 1,
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className={`w-2.5 h-2.5 rounded-full ${
                  streamState.isConnected ? 'bg-green-400' : 'bg-red-400'
                }`}
              />
              <span className="text-gray-400">
                {streamState.isConnected ? 'Connected' : 'Offline'}
              </span>
            </div>

            {/* Language toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="px-3 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-sm font-medium text-gray-300 transition-colors"
            >
              {language === 'en' ? '🇦🇪 AR' : '🇺🇸 EN'}
            </button>
          </div>
        </div>

        <p className="text-gray-400 text-sm">
          Five minds. One vision. Submit your idea and watch the council collaborate.
        </p>
      </div>

      {/* Input Form */}
      <motion.form
        onSubmit={handleSubmit}
        className="mb-8 backdrop-blur-xl bg-slate-800/30 rounded-2xl border border-gray-700/50 p-6"
        variants={scaleBounceVariants}
        whileTap="tap"
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Your Idea
          </label>
          <textarea
            ref={inputRef}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Describe your idea for the AI Council to analyze..."
            disabled={isLoading}
            className="w-full h-24 bg-slate-900/50 border border-gray-700/50 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors resize-none"
          />
        </div>

        <div className="flex justify-end gap-3">
          {isLoading && (
            <button
              type="button"
              onClick={resume}
              className="px-6 py-2 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-600/50 font-medium transition-colors"
            >
              📡 Resume
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading || !streamState.isConnected}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? '⏳ Convening...' : '🏛️ Convene Council'}
          </button>
        </div>
      </motion.form>

      {/* Error Message */}
      {hasError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-lg bg-red-950/50 border border-red-700/50 text-red-300 text-sm flex items-center justify-between"
        >
          <span>⚠️ {streamState.error}</span>
          <button
            onClick={clearError}
            className="hover:text-red-200 transition-colors"
          >
            ✕
          </button>
        </motion.div>
      )}

      {/* Agent Boardroom */}
      {Object.keys(board.state.agents).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-300 mb-4">The Council</h2>
          <AgentBoardroom
            agents={agents}
            responses={board.state.agents}
            activeAgentId={streamState.isStreaming ? Object.keys(board.state.agents)[0] : null}
            isStreaming={streamState.isStreaming}
          />
        </motion.div>
      )}

      {/* Recovery Indicator */}
      <AnimatePresence>
        {showRecovery && recoveryInfo && (
          <RecoveryIndicator
            isVisible={showRecovery}
            fromModel={recoveryInfo.from}
            toModel={recoveryInfo.to}
            onDismiss={() => setShowRecovery(false)}
          />
        )}
      </AnimatePresence>

      {/* Footer Stats */}
      {streamState.isStreaming && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 pt-8 border-t border-gray-700/30 text-xs text-gray-500 text-center"
        >
          Streaming response... Recovery Count: {streamState.recoveryCount} |
          Cursor Position: {streamState.lastCursor}
        </motion.div>
      )}
    </motion.div>
  );
}
