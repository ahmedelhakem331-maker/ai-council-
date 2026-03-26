'use client';

import { useState, useRef, useEffect } from 'react';
import AgentCard from '@/components/AgentCard';
import { AGENTS, runSingleAgent } from '@/lib/agents';
import { saveSession, generateId } from '@/lib/storage';
import { copyToClipboard, exportAsText, exportAsPDF } from '@/lib/export';

export default function DashboardPage() {
  const [idea, setIdea] = useState('');
  const [responses, setResponses] = useState([]);
  const [currentAgentIndex, setCurrentAgentIndex] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const responsesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest response
  useEffect(() => {
    if (responsesEndRef.current) {
      responsesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [responses, currentAgentIndex]);

  async function startCouncil(e) {
    e.preventDefault();
    if (!idea.trim() || isRunning) return;

    const id = generateId();
    setSessionId(id);
    setResponses([]);
    setCurrentAgentIndex(0);
    setIsRunning(true);
    setShowActions(false);
    setCopied(false);

    const allResponses = [];

    for (let i = 0; i < AGENTS.length; i++) {
      setCurrentAgentIndex(i);

      const result = await runSingleAgent(i, idea.trim(), allResponses);
      if (result) {
        allResponses.push(result);
        setResponses([...allResponses]);
      }
    }

    setCurrentAgentIndex(-1);
    setIsRunning(false);
    setShowActions(true);

    // Save session
    saveSession({
      id,
      idea: idea.trim(),
      responses: allResponses,
      createdAt: new Date().toISOString(),
    });
  }

  function handleCopy() {
    const chairmanResponse = responses.find((r) => r.agentId === 'apex');
    if (chairmanResponse) {
      copyToClipboard(chairmanResponse.message).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  function handleExportText() {
    if (!sessionId || responses.length === 0) return;
    exportAsText({ id: sessionId, idea, responses, createdAt: new Date().toISOString() });
  }

  function handleExportPDF() {
    if (!sessionId || responses.length === 0) return;
    exportAsPDF({ id: sessionId, idea, responses, createdAt: new Date().toISOString() });
  }

  function handleNewSession() {
    setIdea('');
    setResponses([]);
    setCurrentAgentIndex(-1);
    setIsRunning(false);
    setSessionId(null);
    setShowActions(false);
    setCopied(false);
    inputRef.current?.focus();
  }

  const isComplete = responses.length === AGENTS.length && !isRunning;

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="font-outfit font-bold text-3xl sm:text-4xl mb-2">
            🏛️ The <span className="gradient-text">Council</span> Awaits
          </h1>
          <p className="text-dark-200 text-sm sm:text-base">
            Submit your idea and watch five AI experts refine it into actionable brilliance.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={startCouncil} className="mb-10 animate-slide-up">
          <div className="glass-strong p-6 rounded-2xl">
            <label htmlFor="idea-input" className="block text-sm font-medium text-dark-200 mb-3 font-outfit">
              💡 What&apos;s your idea?
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                ref={inputRef}
                id="idea-input"
                type="text"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="e.g., A mobile app that helps people learn cooking through AR..."
                disabled={isRunning}
                className="flex-1 bg-dark-800/60 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-dark-300 text-sm focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/20 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isRunning || !idea.trim()}
                className="bg-gradient-to-r from-neon-cyan to-neon-violet text-white font-outfit font-semibold px-8 py-3.5 rounded-xl text-sm hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {isRunning ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Council in Session...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Convene Council
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Agent Progress Bar */}
        {(isRunning || responses.length > 0) && (
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              {AGENTS.map((agent, i) => {
                const isDone = responses.some((r) => r.agentId === agent.id);
                const isCurrent = currentAgentIndex === i;
                return (
                  <div key={agent.id} className="flex-1 flex flex-col items-center gap-1.5">
                    <div
                      className={`w-full h-1.5 rounded-full transition-all duration-500 ${
                        isDone
                          ? `bg-neon-${agent.color}`
                          : isCurrent
                          ? `bg-neon-${agent.color}/50 animate-pulse`
                          : 'bg-dark-600'
                      }`}
                    />
                    <span className={`text-[10px] font-medium transition-colors hidden sm:block ${
                      isDone || isCurrent ? `text-neon-${agent.color}` : 'text-dark-400'
                    }`}>
                      {agent.emoji} {agent.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Responses */}
        <div className="space-y-5">
          {responses.map((r, i) => (
            <AgentCard
              key={r.agentId}
              agent={r.agent}
              message={r.message}
              isChairman={r.agentId === 'apex'}
              animationDelay={0}
            />
          ))}

          {/* Typing indicator for current agent */}
          {isRunning && currentAgentIndex >= 0 && currentAgentIndex < AGENTS.length && (
            <AgentCard
              agent={AGENTS[currentAgentIndex]}
              message=""
              isTyping={true}
              isChairman={AGENTS[currentAgentIndex].id === 'apex'}
            />
          )}

          <div ref={responsesEndRef} />
        </div>

        {/* Action Buttons */}
        {showActions && isComplete && (
          <div className="mt-8 glass-strong p-5 rounded-2xl animate-scale-in">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <p className="text-sm text-dark-200 font-medium sm:mr-auto">
                ✅ Council session complete
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-sm font-medium hover:bg-neon-cyan/20 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {copied ? 'Copied!' : 'Copy Summary'}
                </button>
                <button
                  onClick={handleExportText}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-violet/10 border border-neon-violet/20 text-neon-violet text-sm font-medium hover:bg-neon-violet/20 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export .txt
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-emerald/10 border border-neon-emerald/20 text-neon-emerald text-sm font-medium hover:bg-neon-emerald/20 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Export PDF
                </button>
                <button
                  onClick={handleNewSession}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Session
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {responses.length === 0 && !isRunning && (
          <div className="text-center py-20 animate-fade-in">
            <div className="text-6xl mb-6">🏛️</div>
            <h3 className="font-outfit font-semibold text-xl text-dark-100 mb-2">
              The council chamber is ready
            </h3>
            <p className="text-dark-300 text-sm max-w-md mx-auto">
              Enter an idea above and convene the council. Five AI agents will analyze,
              enhance, critique, and synthesize your concept.
            </p>

            {/* Agent roster */}
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-2xl mx-auto">
              {AGENTS.map((agent) => (
                <div key={agent.id} className="glass-card p-3 flex flex-col items-center gap-2">
                  <span className="text-2xl">{agent.emoji}</span>
                  <span className={`text-xs font-semibold font-outfit text-neon-${agent.color}`}>
                    {agent.name}
                  </span>
                  <span className="text-[10px] text-dark-400 text-center">{agent.role}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
