import AgentAvatar from './AgentAvatar';

const borderColors = {
  cyan: 'border-l-neon-cyan',
  violet: 'border-l-neon-violet',
  rose: 'border-l-neon-rose',
  emerald: 'border-l-neon-emerald',
  amber: 'border-l-neon-amber',
};

const nameColors = {
  cyan: 'text-neon-cyan',
  violet: 'text-neon-violet',
  rose: 'text-neon-rose',
  emerald: 'text-neon-emerald',
  amber: 'text-neon-amber',
};

const bgDots = {
  cyan: 'bg-neon-cyan',
  violet: 'bg-neon-violet',
  rose: 'bg-neon-rose',
  emerald: 'bg-neon-emerald',
  amber: 'bg-neon-amber',
};

export default function AgentCard({ agent, message, isTyping = false, isChairman = false, animationDelay = 0 }) {
  const borderColor = borderColors[agent.color] || 'border-l-neon-cyan';
  const nameColor = nameColors[agent.color] || 'text-neon-cyan';
  const dotBg = bgDots[agent.color] || 'bg-neon-cyan';

  return (
    <div
      className={`
        relative glass-card border-l-4 ${borderColor} p-5 
        animate-slide-up
        ${isChairman ? 'ring-1 ring-neon-amber/30 glow-amber' : ''}
      `}
      style={{ animationDelay: `${animationDelay}ms`, animationFillMode: 'both' }}
    >
      {/* Chairman badge */}
      {isChairman && (
        <div className="absolute -top-3 right-4 bg-gradient-to-r from-neon-amber to-yellow-500 text-dark-900 text-xs font-bold font-outfit px-3 py-1 rounded-full shadow-neon-amber">
          ★ FINAL VERDICT
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <AgentAvatar emoji={agent.emoji} color={agent.color} pulse={isTyping} />
        <div>
          <h4 className={`font-outfit font-semibold ${nameColor}`}>
            {agent.name}
          </h4>
          <p className="text-xs text-dark-300">{agent.role}</p>
        </div>
      </div>

      {/* Content */}
      {isTyping ? (
        <div className="typing-indicator ml-1">
          <span className={dotBg} />
          <span className={dotBg} />
          <span className={dotBg} />
        </div>
      ) : (
        <div className="text-sm text-dark-100 leading-relaxed whitespace-pre-wrap pl-1">
          {message}
        </div>
      )}
    </div>
  );
}
