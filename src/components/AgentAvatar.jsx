const colorMap = {
  cyan: {
    bg: 'bg-neon-cyan/20',
    border: 'border-neon-cyan/30',
    text: 'text-neon-cyan',
    ring: 'ring-neon-cyan/40',
    glow: 'shadow-neon-cyan',
  },
  violet: {
    bg: 'bg-neon-violet/20',
    border: 'border-neon-violet/30',
    text: 'text-neon-violet',
    ring: 'ring-neon-violet/40',
    glow: 'shadow-neon-violet',
  },
  rose: {
    bg: 'bg-neon-rose/20',
    border: 'border-neon-rose/30',
    text: 'text-neon-rose',
    ring: 'ring-neon-rose/40',
    glow: 'shadow-neon-rose',
  },
  emerald: {
    bg: 'bg-neon-emerald/20',
    border: 'border-neon-emerald/30',
    text: 'text-neon-emerald',
    ring: 'ring-neon-emerald/40',
    glow: 'shadow-neon-emerald',
  },
  amber: {
    bg: 'bg-neon-amber/20',
    border: 'border-neon-amber/30',
    text: 'text-neon-amber',
    ring: 'ring-neon-amber/40',
    glow: 'shadow-neon-amber',
  },
};

export default function AgentAvatar({ emoji, color = 'cyan', size = 'md', pulse = false }) {
  const c = colorMap[color] || colorMap.cyan;
  const sizes = {
    sm: 'w-8 h-8 text-base',
    md: 'w-11 h-11 text-xl',
    lg: 'w-14 h-14 text-2xl',
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      {pulse && (
        <div
          className={`absolute inset-0 rounded-full ${c.bg} animate-ping`}
          style={{ animationDuration: '2s' }}
        />
      )}
      <div
        className={`
          relative rounded-full ${sizes[size]} ${c.bg} border ${c.border}
          flex items-center justify-center
          ${pulse ? c.glow : ''}
          transition-all duration-300
        `}
      >
        <span role="img" aria-hidden="true">{emoji}</span>
      </div>
    </div>
  );
}
