'use client';

import Link from 'next/link';
import GlassCard from '@/components/GlassCard';
import { AGENTS } from '@/lib/agents';

const features = [
  {
    icon: '🧠',
    title: 'Multi-Agent Intelligence',
    description: 'Five specialized AI agents analyze your idea from every angle simultaneously.',
  },
  {
    icon: '⚡',
    title: 'Real-Time Discussion',
    description: 'Watch agents debate, enhance, and refine your concept in a live council format.',
  },
  {
    icon: '🎯',
    title: 'Actionable Output',
    description: 'Get a synthesized verdict with clear next steps, not just raw suggestions.',
  },
  {
    icon: '📊',
    title: 'Business-Ready',
    description: 'Includes market analysis, risk assessment, and go-to-market strategy.',
  },
  {
    icon: '💾',
    title: 'Save & Export',
    description: 'Keep your sessions, revisit them anytime, and export as PDF or text.',
  },
  {
    icon: '🚀',
    title: 'Instant Results',
    description: 'No setup required. Submit your idea and get a full council review in seconds.',
  },
];

const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['3 councils per day', '5 core agents', 'Copy results', 'Session history'],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    features: [
      'Unlimited councils',
      'Custom agent roles',
      'PDF & text export',
      'Priority processing',
      'Advanced templates',
      'API access',
    ],
    cta: 'Start Pro Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$49',
    period: '/month',
    features: [
      'Everything in Pro',
      'Team workspaces',
      'Shared council history',
      'SSO & admin controls',
      'Dedicated support',
      'Custom integrations',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen pt-16">
      {/* ═══ Hero Section ═══ */}
      <section className="relative px-4 pt-20 pb-32 sm:pt-32 sm:pb-40 overflow-hidden">
        {/* Animated grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,240,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-dark-200 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-neon-emerald animate-pulse" />
            Powered by Multi-Agent AI
          </div>

          {/* Headline */}
          <h1 className="font-outfit font-900 text-4xl sm:text-6xl lg:text-7xl leading-tight mb-6 animate-slide-up">
            Five Minds.
            <br />
            <span className="gradient-text">One Vision.</span>
          </h1>

          <p className="text-lg sm:text-xl text-dark-200 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
            Submit any idea and watch five AI agents debate, enhance, and refine it
            into actionable brilliance — like having a board of advisors on demand.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <Link
              href="/dashboard"
              className="btn-neon bg-gradient-to-r from-neon-cyan/20 to-neon-violet/20 text-white text-lg px-8 py-4 rounded-xl inline-flex items-center gap-3 font-outfit font-semibold"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Start Your Council
            </Link>
            <a
              href="#features"
              className="text-dark-200 hover:text-white transition-colors px-6 py-4 text-lg font-medium"
            >
              Learn More ↓
            </a>
          </div>
        </div>

        {/* Agent Avatars Floating */}
        <div className="relative max-w-4xl mx-auto mt-16 hidden sm:block">
          <div className="flex justify-center gap-6">
            {AGENTS.map((agent, i) => (
              <div
                key={agent.id}
                className="animate-float glass-card p-4 flex flex-col items-center gap-2"
                style={{
                  animationDelay: `${i * 0.4}s`,
                  animationDuration: `${5 + i * 0.5}s`,
                }}
              >
                <span className="text-3xl">{agent.emoji}</span>
                <span className={`text-xs font-semibold font-outfit text-neon-${agent.color}`}>
                  {agent.name}
                </span>
                <span className="text-[10px] text-dark-300">{agent.role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Features Section ═══ */}
      <section id="features" className="px-4 py-24 bg-dark-800/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-outfit font-bold text-3xl sm:text-4xl mb-4">
              Why <span className="gradient-text">AI Council</span>?
            </h2>
            <p className="text-dark-200 text-lg max-w-xl mx-auto">
              Stop getting one-dimensional AI responses. Get a full spectrum of expert perspectives.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <GlassCard key={i} className="animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="font-outfit font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-dark-200 text-sm leading-relaxed">{feature.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ How It Works ═══ */}
      <section className="px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-outfit font-bold text-3xl sm:text-4xl mb-4">
              How It <span className="gradient-text-warm">Works</span>
            </h2>
          </div>

          <div className="space-y-8">
            {[
              { step: '01', title: 'Submit Your Idea', desc: 'Type in any concept, business idea, or creative challenge.', color: 'cyan' },
              { step: '02', title: 'Agents Discuss', desc: 'Five AI agents analyze your idea from different expert perspectives.', color: 'violet' },
              { step: '03', title: 'Chairman Synthesizes', desc: 'The Chairman merges all inputs into one actionable final verdict.', color: 'amber' },
              { step: '04', title: 'Export & Execute', desc: 'Copy, export as PDF, or save your council session for later.', color: 'emerald' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-6 group">
                <div className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-neon-${item.color}/10 border border-neon-${item.color}/20 flex items-center justify-center font-outfit font-bold text-neon-${item.color} text-lg group-hover:scale-110 transition-transform`}>
                  {item.step}
                </div>
                <div>
                  <h3 className="font-outfit font-semibold text-xl mb-1">{item.title}</h3>
                  <p className="text-dark-200">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Pricing Section ═══ */}
      <section id="pricing" className="px-4 py-24 bg-dark-800/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-outfit font-bold text-3xl sm:text-4xl mb-4">
              Simple <span className="gradient-text">Pricing</span>
            </h2>
            <p className="text-dark-200 text-lg max-w-xl mx-auto">
              Start for free. Upgrade when you need more.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <div
                key={i}
                className={`glass-card p-8 relative flex flex-col ${
                  plan.popular ? 'ring-2 ring-neon-cyan/50 glow-cyan scale-[1.02]' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-neon-cyan to-neon-violet text-white text-xs font-bold px-4 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="font-outfit font-bold text-xl mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="font-outfit font-bold text-4xl">{plan.price}</span>
                  <span className="text-dark-300 text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-dark-100">
                      <svg className="w-4 h-4 text-neon-emerald flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/dashboard"
                  className={`text-center py-3 px-6 rounded-xl font-semibold text-sm transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-neon-cyan to-neon-violet text-white hover:opacity-90'
                      : 'glass border border-white/10 text-white hover:border-white/20'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="px-4 py-12 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-violet flex items-center justify-center text-white font-outfit font-bold text-xs">
              AC
            </div>
            <span className="font-outfit font-semibold">AI Council</span>
          </div>
          <p className="text-dark-300 text-sm">
            © 2026 AI Council. Five Minds. One Vision.
          </p>
          <div className="flex gap-6 text-dark-300 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
