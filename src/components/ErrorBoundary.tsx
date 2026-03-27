'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  lastKnownState: {
    timestamp: number;
    userAgent: string;
    url: string;
  };
}

/**
 * Error Boundary with state preservation
 * Captures errors and logs last known state
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      lastKnownState: {
        timestamp: Date.now(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        url: typeof window !== 'undefined' ? window.location.href : '',
      },
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console (in development)
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Send error to logging service
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = async (error: Error, errorInfo: React.ErrorInfo) => {
    try {
      const errorPayload = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        ...this.state.lastKnownState,
      };

      // Send to your error logging service
      // await fetch('/api/log-client-error', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorPayload),
      // });
    } catch (err) {
      console.error('Failed to log error:', err);
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      lastKnownState: {
        timestamp: Date.now(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        url: typeof window !== 'undefined' ? window.location.href : '',
      },
    });

    // Clear localStorage state if needed
    if (typeof window !== 'undefined') {
      localStorage.removeItem('session_draft');
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-slate-950 flex items-center justify-center p-4"
          >
            <div className="max-w-md w-full backdrop-blur-xl bg-red-950/30 rounded-2xl border border-red-700/50 p-8 text-center">
              <div className="text-5xl mb-4">⚠️</div>

              <h1 className="text-2xl font-bold text-red-300 mb-2">Something went wrong</h1>

              <p className="text-red-200/70 text-sm mb-6">
                The application encountered an unexpected error. We've recorded this incident
                and our team will look into it.
              </p>

              {this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-xs text-red-300/60 hover:text-red-300 mb-2">
                    Error Details
                  </summary>
                  <pre className="bg-slate-900/50 rounded p-2 text-xs text-red-400 overflow-auto max-h-32">
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 font-medium transition-colors"
                >
                  Refresh Page
                </button>

                <button
                  onClick={this.handleReset}
                  className="flex-1 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </motion.div>
        )
      );
    }

    return this.props.children;
  }
}
