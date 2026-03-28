'use client';

import { useState, useEffect } from 'react';
import { getSessions, deleteSession } from '@/lib/storage';
import { AGENTS } from '@/lib/agents';
import { AgentCard } from '@/components/AgentCard';

export default function HistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSessions(getSessions());
    setLoaded(true);
  }, []);

  function handleDelete(e, id) {
    e.stopPropagation();
    if (confirm('Delete this council session?')) {
      const updated = deleteSession(id);
      setSessions(updated);
      if (selectedSession?.id === id) {
        setSelectedSession(null);
      }
    }
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  if (!loaded) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-pulse text-dark-300">Loading sessions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-10 animate-fade-in">
          <h1 className="font-outfit font-bold text-3xl sm:text-4xl mb-2">
            📜 Council <span className="gradient-text">History</span>
          </h1>
          <p className="text-dark-200 text-sm sm:text-base">
            Review past council sessions and revisit the insights.
          </p>
        </div>

        {sessions.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20 animate-fade-in">
            <div className="text-6xl mb-6">📭</div>
            <h3 className="font-outfit font-semibold text-xl text-dark-100 mb-2">
              No sessions yet
            </h3>
            <p className="text-dark-300 text-sm max-w-md mx-auto mb-6">
              Start a council session from the Dashboard and your history will appear here.
            </p>
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-neon-cyan to-neon-violet text-white px-6 py-3 rounded-xl font-outfit font-semibold text-sm hover:opacity-90 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Start Your First Council
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Session List */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-dark-300 font-medium">
                  {sessions.length} session{sessions.length !== 1 ? 's' : ''}
                </span>
              </div>

              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className={`w-full text-left glass-card p-4 transition-all group ${
                    selectedSession?.id === session.id
                      ? 'ring-1 ring-neon-cyan/40 glow-cyan border-neon-cyan/20'
                      : 'hover:border-white/15'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate mb-1">
                        {session.idea}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-dark-300">
                        <span>{formatDate(session.createdAt || session.updatedAt)}</span>
                        <span>•</span>
                        <span>{session.responses?.length || 0} agents</span>
                      </div>
                      {/* Agent emojis */}
                      <div className="flex gap-1 mt-2">
                        {(session.responses || []).map((r) => (
                          <span key={r.agentId} className="text-xs">
                            {r.agent.emoji}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, session.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-neon-rose/10 text-dark-400 hover:text-neon-rose transition-all"
                      title="Delete session"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </button>
              ))}
            </div>

            {/* Session Detail */}
            <div className="lg:col-span-3">
              {selectedSession ? (
                <div className="space-y-4 animate-fade-in">
                  {/* Session header */}
                  <div className="glass-strong p-5 rounded-2xl">
                    <h2 className="font-outfit font-semibold text-lg mb-1 text-white">
                      {selectedSession.idea}
                    </h2>
                    <p className="text-xs text-dark-300">
                      {new Date(selectedSession.createdAt).toLocaleString()} •{' '}
                      {selectedSession.responses?.length || 0} agent responses
                    </p>
                  </div>

                  {/* Responses */}
                  {(selectedSession.responses || []).map((r) => (
                    <AgentCard
                      key={r.agentId}
                      agent={r.agent}
                      message={r.message}
                      isChairman={r.agentId === 'apex'}
                      animationDelay={0}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 glass-card rounded-2xl">
                  <div className="text-center">
                    <div className="text-4xl mb-3">👈</div>
                    <p className="text-dark-300 text-sm">Select a session to review</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
