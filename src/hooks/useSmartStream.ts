'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface StreamMessage {
  type: string;
  content?: string;
  agent?: {
    id: string;
    name: string;
    role: string;
    emoji: string;
    color: string;
  };
  trace_id: string;
  meta?: {
    model: string;
    recovery: boolean;
    cursor: number;
  };
  message?: string;
  error_code?: string;
}

interface StreamState {
  isConnected: boolean;
  isStreaming: boolean;
  isRecovering: boolean;
  messages: StreamMessage[];
  lastCursor: number;
  partialMessage: string;
  error: string | null;
  model: string;
  recoveryCount: number;
}

type StreamHandler = (message: StreamMessage) => void;

/**
 * Master hook for AI streaming with resilience
 * Handles WebSocket connection, recovery, and optimistic UI
 */
export function useSmartStream(wsUrl: string = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/chat') {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const [state, setState] = useState<StreamState>({
    isConnected: false,
    isStreaming: false,
    isRecovering: false,
    messages: [],
    lastCursor: 0,
    partialMessage: '',
    error: null,
    model: 'gpt-4o',
    recoveryCount: 0,
  });

  const handleersRef = useRef<Set<StreamHandler>>(new Set());

  // Subscribe to stream messages
  const subscribe = useCallback((handler: StreamHandler) => {
    handleersRef.current.add(handler);
    return () => handleersRef.current.delete(handler);
  }, []);

  // Emit message to subscribers
  const emit = useCallback((message: StreamMessage) => {
    handleersRef.current.forEach((handler) => handler(message));
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('[WS] Connected');
        setState((prev) => ({
          ...prev,
          isConnected: true,
          error: null,
        }));
        reconnectAttemptsRef.current = 0;
      };

      wsRef.current.onmessage = (event) => {
        const message: StreamMessage = JSON.parse(event.data);

        // Handle different message types
        switch (message.type) {
          case 'token': {
            setState((prev) => ({
              ...prev,
              partialMessage: prev.partialMessage + (message.content || ''),
              lastCursor: message.meta?.cursor || prev.lastCursor + 1,
              model: message.meta?.model || prev.model,
            }));
            emit(message);
            break;
          }

          case 'recovery_start': {
            console.log(`[Recovery] Switching from ${message.message} to fallback`);
            setState((prev) => ({
              ...prev,
              isRecovering: true,
              recoveryCount: prev.recoveryCount + 1,
            }));
            emit(message);
            break;
          }

          case 'recovery_end': {
            console.log('[Recovery] Complete');
            setState((prev) => ({
              ...prev,
              isRecovering: false,
            }));
            emit(message);
            break;
          }

          case 'agent_complete': {
            setState((prev) => ({
              ...prev,
              messages: [
                ...prev.messages,
                {
                  type: 'agent_complete',
                  content: prev.partialMessage,
                  trace_id: message.trace_id,
                },
              ],
              partialMessage: '',
            }));
            emit(message);
            break;
          }

          case 'session_complete': {
            setState((prev) => ({
              ...prev,
              isStreaming: false,
            }));
            emit(message);
            break;
          }

          case 'error': {
            console.error('[WS Error]', message.message);
            setState((prev) => ({
              ...prev,
              error: message.message,
            }));
            emit(message);
            break;
          }

          case 'ping': {
            // Respond to heartbeat
            wsRef.current?.send(
              JSON.stringify({
                type: 'pong',
                timestamp: new Date().toISOString(),
              })
            );
            break;
          }

          default: {
            emit(message);
          }
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('[WS Error]', error);
        setState((prev) => ({
          ...prev,
          error: 'WebSocket connection error',
        }));
      };

      wsRef.current.onclose = () => {
        console.log('[WS] Disconnected');
        setState((prev) => ({
          ...prev,
          isConnected: false,
        }));

        // Attempt reconnect with exponential backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current += 1;
            console.log(`[WS] Reconnecting... (attempt ${reconnectAttemptsRef.current})`);
            connect();
          }, delay);
        } else {
          setState((prev) => ({
            ...prev,
            error: 'Failed to reconnect after maximum attempts',
          }));
        }
      };
    } catch (error) {
      console.error('[WS] Connection failed:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to connect to WebSocket',
      }));
    }
  }, [wsUrl, emit]);

  // Disconnect gracefully
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
  }, []);

  // Send streaming request
  const sendMessage = useCallback(
    (idea: string, language: string = 'en') => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        setState((prev) => ({
          ...prev,
          error: 'WebSocket not connected',
        }));
        return;
      }

      // Clear previous session
      setState((prev) => ({
        ...prev,
        messages: [],
        partialMessage: '',
        lastCursor: 0,
        error: null,
        isStreaming: true,
      }));

      // Save to localStorage (optimistic update)
      const sessionData = {
        idea,
        timestamp: new Date().toISOString(),
        status: 'streaming',
      };
      localStorage.setItem(`session_draft_${Date.now()}`, JSON.stringify(sessionData));

      // Send initiation message
      wsRef.current.send(
        JSON.stringify({
          idea,
          language,
          timestamp: new Date().toISOString(),
        })
      );
    },
    []
  );

  // Resume from cursor
  const resume = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setState((prev) => ({
        ...prev,
        error: 'WebSocket not connected, cannot resume',
      }));
      return;
    }

    // Send resume signal with cursor
    wsRef.current.send(
      JSON.stringify({
        type: 'resume',
        cursor: state.lastCursor,
        trace_id: state.messages[0]?.trace_id,
      })
    );

    setState((prev) => ({
      ...prev,
      isRecovering: true,
    }));
  }, [state.lastCursor, state.messages]);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    // State
    state,

    // Methods
    connect,
    disconnect,
    sendMessage,
    resume,
    clearError,
    subscribe,

    // Computed
    isReady: state.isConnected && !state.isStreaming,
  };
}
