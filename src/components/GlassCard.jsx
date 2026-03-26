export default function GlassCard({ children, className = '', hover = true, glow = '' }) {
  return (
    <div
      className={`
        glass-card p-6
        ${hover ? 'hover:border-white/12 hover:-translate-y-1 hover:shadow-xl' : ''}
        ${glow ? `glow-${glow}` : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
