'use client';

import { motion } from 'framer-motion';
import { gridVariants } from '@/lib/animations';
import { AgentCard } from './AgentCard';
import { useReducer, useState, useCallback, useEffect } from 'react';

interface Agent {
  id: string;
  name: string;
  role: string;
  emoji: string;
  color: string;
}

interface AgentResponse {
  agentId: string;
  content: string;
  tokensUsed?: number;
  latencyMs?: number;
  isStreaming?: boolean;
}

interface BoardroomProps {
  agents: Agent[];
  responses: Record<string, AgentResponse>;
  activeAgentId: string | null;
  isStreaming: boolean;
  className?: string;
}

/**
 * Agent Boardroom - 2x2 responsive grid with focal point
 * Shows all agents with active agent highlighted and others dimmed
 */
export function AgentBoardroom({
  agents,
  responses,
  activeAgentId,
  isStreaming,
  className = '',
}: BoardroomProps) {
  // Responsive grid layout
  const gridClass =
    'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 auto-rows-fr';

  return (
    <motion.div
      variants={gridVariants.container}
      initial="hidden"
      animate="visible"
      className={`${gridClass} ${className}`}
    >
      {agents.map((agent) => {
        const response = responses[agent.id];
        const isActive = agent.id === activeAgentId;

        return (
          <motion.div
            key={agent.id}
            variants={gridVariants.item}
            layout
            className="min-h-96"
          >
            <AgentCard
              agent={agent}
              isActive={isActive}
              isStreaming={isActive && isStreaming}
              content={response?.content || ''}
              tokensUsed={response?.tokensUsed}
              latencyMs={response?.latencyMs}
              className="h-full"
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
}

/**
 * Board Controller Hook - Manages agent state and responses
 */
interface BoardState {
  agents: Record<string, AgentResponse>;
  activeAgentIndex: number;
  isStreaming: boolean;
  sessionId: string | null;
  traceId: string | null;
}

type BoardAction =
  | { type: 'START_SESSION'; sessionId: string; traceId: string }
  | { type: 'AGENT_START'; agentId: string }
  | { type: 'AGENT_STREAM'; agentId: string; content: string }
  | { type: 'AGENT_COMPLETE'; agentId: string; tokensUsed: number; latencyMs: number }
  | { type: 'SESSION_COMPLETE' }
  | { type: 'RESET' };

function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case 'START_SESSION':
      return {
        ...state,
        sessionId: action.sessionId,
        traceId: action.traceId,
        isStreaming: true,
        agents: {},
      };

    case 'AGENT_START':
      return {
        ...state,
        agents: {
          ...state.agents,
          [action.agentId]: {
            agentId: action.agentId,
            content: '',
            isStreaming: true,
          },
        },
      };

    case 'AGENT_STREAM':
      return {
        ...state,
        agents: {
          ...state.agents,
          [action.agentId]: {
            ...state.agents[action.agentId],
            agentId: action.agentId,
            content: (state.agents[action.agentId]?.content || '') + action.content,
            isStreaming: true,
          },
        },
      };

    case 'AGENT_COMPLETE':
      return {
        ...state,
        agents: {
          ...state.agents,
          [action.agentId]: {
            ...state.agents[action.agentId],
            agentId: action.agentId,
            tokensUsed: action.tokensUsed,
            latencyMs: action.latencyMs,
            isStreaming: false,
          },
        },
      };

    case 'SESSION_COMPLETE':
      return {
        ...state,
        isStreaming: false,
      };

    case 'RESET':
      return {
        agents: {},
        activeAgentIndex: 0,
        isStreaming: false,
        sessionId: null,
        traceId: null,
      };

    default:
      return state;
  }
}

export function useBoardController() {
  const [state, dispatch] = useReducer(boardReducer, {
    agents: {},
    activeAgentIndex: 0,
    isStreaming: false,
    sessionId: null,
    traceId: null,
  });

  const startSession = useCallback((sessionId: string, traceId: string) => {
    dispatch({ type: 'START_SESSION', sessionId, traceId });
  }, []);

  const setActiveAgent = useCallback((agentId: string) => {
    dispatch({ type: 'AGENT_START', agentId });
  }, []);

  const addStreamContent = useCallback((agentId: string, content: string) => {
    dispatch({ type: 'AGENT_STREAM', agentId, content });
  }, []);

  const completeAgent = useCallback(
    (agentId: string, tokensUsed: number, latencyMs: number) => {
      dispatch({ type: 'AGENT_COMPLETE', agentId, tokensUsed, latencyMs });
    },
    []
  );

  const completeSession = useCallback(() => {
    dispatch({ type: 'SESSION_COMPLETE' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    state,
    startSession,
    setActiveAgent,
    addStreamContent,
    completeAgent,
    completeSession,
    reset,
  };
}
