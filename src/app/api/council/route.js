import { NextResponse } from 'next/server';
import { AGENTS } from '@/lib/agents';

// ═══════════════════════════════════════════
// AI COUNCIL — Council API Route
// ═══════════════════════════════════════════
// POST /api/council
// Body: { idea: string }
// Returns: { responses: AgentResponse[] }
//
// This uses simulated responses. To integrate real LLMs:
// 1. Import your LLM SDK (OpenAI, Anthropic, etc.)
// 2. Replace generateResponse() with actual API calls
// 3. Pass agent.systemPrompt as the system message
// ═══════════════════════════════════════════

function generateResponse(agent, idea, priorMessages) {
  // Simulated responses keyed by agent role
  const templates = {
    nova: `💡 **Expanding "${idea}"**\n\nAs the Idea Generator, I see massive potential here. Let me explore the key dimensions:\n\n1. **Core Extension**: This concept can be extended into a platform play — not just a single solution, but an ecosystem.\n2. **Innovation Angle**: Consider adding AI-powered personalization to make each user's experience unique.\n3. **Scale Vision**: Start focused, but design the architecture to support 10x growth from day one.\n4. **Unique Twist**: Add a social/community layer that makes users feel part of something bigger.`,

    pixel: `🎨 **Creative Vision for "${idea}"**\n\nAs the Creative Enhancer, here's how I'd elevate this:\n\n1. **Brand Identity**: This needs a name and visual language that feels premium and memorable.\n2. **User Delight**: Add micro-interactions and Easter eggs — small moments of joy build loyalty.\n3. **Storytelling**: Frame the product narrative around transformation — before vs. after using this.\n4. **Visual Design**: Dark theme with accent colors, glassmorphism effects, and smooth animations.`,

    cipher: `🔍 **Critical Analysis of "${idea}"**\n\nAs the Critical Analyst, here are the important considerations:\n\n1. **Risk Assessment**: The primary risk is market saturation — focus on defensible differentiation.\n2. **Technical Debt**: Plan for scalability from the start to avoid costly rewrites.\n3. **User Retention**: Have a clear strategy for keeping users engaged after the initial wow factor fades.\n4. **Competition**: Research existing solutions thoroughly — your unique value must be crystal clear.`,

    vector: `📊 **Business Strategy for "${idea}"**\n\nAs the Business Strategist, here's the market playbook:\n\n1. **Market Opportunity**: This aligns with growing demand in the AI-productivity space.\n2. **Monetization**: Freemium model with clear upgrade triggers at usage limits.\n3. **Go-to-Market**: Launch on Product Hunt, build a content flywheel, partner with influencers.\n4. **Unit Economics**: Target $15-25/mo price point with >80% gross margins.`,

    apex: `👑 **CHAIRMAN'S VERDICT on "${idea}"**\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nAfter reviewing all council inputs:\n\n## Verdict: APPROVED ✅\n\n**Key Actions:**\n1. Build MVP in 4 weeks with core features\n2. Focus on UX polish as the key differentiator\n3. Launch with freemium model at $19/mo Pro tier\n4. Invest in content marketing and community building\n\n**Watch Items:**\n- Monitor user retention metrics closely\n- A/B test pricing within first 90 days\n- Build feedback loops into the product\n\n**The council agrees: this concept has strong potential. Execute with excellence.**\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
  };

  return templates[agent.id] || `Response from ${agent.name} about "${idea}"`;
}

export async function POST(request) {
  try {
    const { idea } = await request.json();

    if (!idea || typeof idea !== 'string' || idea.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please provide a valid idea' },
        { status: 400 }
      );
    }

    const responses = [];

    for (const agent of AGENTS) {
      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 200));

      const message = generateResponse(agent, idea.trim(), responses);

      responses.push({
        agentId: agent.id,
        agent: {
          id: agent.id,
          name: agent.name,
          role: agent.role,
          emoji: agent.emoji,
          color: agent.color,
        },
        message,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({ responses });
  } catch (error) {
    console.error('Council API error:', error);
    return NextResponse.json(
      { error: 'Council session failed' },
      { status: 500 }
    );
  }
}
