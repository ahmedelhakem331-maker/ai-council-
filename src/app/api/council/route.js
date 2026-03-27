import { NextResponse } from 'next/server';
import { AGENTS } from '@/lib/agents';

// ═══════════════════════════════════════════
// AI COUNCIL — Council API Route (Dynamic)
// ═══════════════════════════════════════════

async function callOpenAI(agent, idea, priorResponses) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const history = priorResponses.map(r => ({
      role: 'assistant',
      content: `${r.agent.name}: ${r.message}`
    }));

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: agent.systemPrompt },
          ...history,
          { role: 'user', content: `Here is the user's idea: "${idea}"\n\nPlease provide your input as ${agent.name} (${agent.role}).` }
        ],
        temperature: 0.7,
      })
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content;
  } catch (error) {
    console.error(`OpenAI error for ${agent.name}:`, error);
    return null;
  }
}

function generateDynamicSimulatedResponse(agent, idea) {
  // A smarter simulator that rephrases based on the idea
  const templates = {
    nova: `💡 **Expanding on "${idea}"**\n\nThis is a fascinating concept. As an Idea Generator, I see several ways to push this further:\n\n1. **Ecological Integration**: How can "${idea}" serve not just the user, but their entire community?\n2. **Gamification**: Adding a reward layer to "${idea}" could increase retention by 40%.\n3. **Hyper-Personalization**: Use data to make "${idea}" feel like it was custom-built for every single individual.`,
    pixel: `🎨 **Visual Soul for "${idea}"**\n\nTo make "${idea}" stand out, we need a bold aesthetic. I suggest a "Glassmorphism Neon" theme. It conveys innovation and transparency. The color palette should be vibrant but professional, matching the ambitious nature of the project.`,
    cipher: `🔍 **Stress-Testing "${idea}"**\n\nI've analyzed "${idea}" for potential pitfalls. The biggest risk is scalability. If we hit 10k users, how will "${idea}" handle the load? We need a robust cloud architecture and early validation of the core loop.`,
    vector: `📊 **The Business of "${idea}"**\n\nMarket analysis suggests that "${idea}" taps into a $2B underserved niche. I recommend a tiered subscription model: Free for individuals, Pro for professionals, and Enterprise for teams. Let's aim for a \$15/mo price point.`,
    apex: `👑 **CHAIRMAN'S VERDICT: "${idea}"**\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nAfter hearing from the council, we are in agreement: **"${idea}" is a winner.** \n\n**Next Steps:**\n1. Prototype the core functionality of "${idea}" within 2 weeks.\n2. Design the brand identity around the "Neon-Future" aesthetic Pixel suggested.\n3. Implement the tiered pricing strategy Vector proposed.\n\nExecute with speed. The market for "${idea}" is waiting.`,
  };

  return templates[agent.id] || `This is my expert opinion on "${idea}". It has great potential but requires careful execution.`;
}

export async function POST(request) {
  try {
    const { idea } = await request.json();

    if (!idea || typeof idea !== 'string' || idea.trim().length === 0) {
      return NextResponse.json({ error: 'Please provide a valid idea' }, { status: 400 });
    }

    const responses = [];

    for (const agent of AGENTS) {
      let message = await callOpenAI(agent, idea.trim(), responses);
      
      if (!message) {
        // Fallback to dynamic simulation if OpenAI fails or key is missing
        message = generateDynamicSimulatedResponse(agent, idea.trim());
      }

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
    return NextResponse.json({ error: 'Council session failed' }, { status: 500 });
  }
}
