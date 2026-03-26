// ═══════════════════════════════════════════
// AI COUNCIL — Agent Definitions & Simulation
// ═══════════════════════════════════════════

export const AGENTS = [
  {
    id: 'nova',
    name: 'Nova',
    role: 'Idea Generator',
    emoji: '💡',
    color: 'cyan',
    description: 'Expands ideas with creative possibilities and new angles',
    systemPrompt: 'You are Nova, the Idea Generator. Your role is to take the user\'s initial idea and expand it with creative possibilities, unique angles, and innovative twists. Think big, think different.',
  },
  {
    id: 'pixel',
    name: 'Pixel',
    role: 'Creative Enhancer',
    emoji: '🎨',
    color: 'violet',
    description: 'Adds artistic flair, branding ideas, and user experience insights',
    systemPrompt: 'You are Pixel, the Creative Enhancer. Your role is to take the ideas presented and elevate them with creative branding, design thinking, storytelling, and user experience insights.',
  },
  {
    id: 'cipher',
    name: 'Cipher',
    role: 'Critical Analyst',
    emoji: '🔍',
    color: 'rose',
    description: 'Identifies risks, flaws, and areas for improvement',
    systemPrompt: 'You are Cipher, the Critical Analyst. Your role is to carefully analyze the ideas presented, identify potential flaws, risks, blind spots, and suggest improvements. Be constructive but thorough.',
  },
  {
    id: 'vector',
    name: 'Vector',
    role: 'Business Strategist',
    emoji: '📊',
    color: 'emerald',
    description: 'Evaluates market fit, revenue potential, and growth strategy',
    systemPrompt: 'You are Vector, the Business Strategist. Your role is to evaluate the business potential—market fit, monetization, competitive landscape, scalability, and go-to-market strategy.',
  },
  {
    id: 'apex',
    name: 'Apex',
    role: 'Chairman',
    emoji: '👑',
    color: 'amber',
    description: 'Synthesizes all inputs into a final, actionable verdict',
    systemPrompt: 'You are Apex, the Chairman of the AI Council. Your role is to synthesize all the inputs from Nova, Pixel, Cipher, and Vector into a final, cohesive, and actionable plan. Deliver the verdict clearly.',
  },
];

// ── Simulated Response Generator ─────────────────────

function generateSimulatedResponse(agent, idea, priorResponses) {
  const responses = {
    nova: [
      `🚀 **Expanding on "${idea}"**\n\nThis concept has incredible potential. Here's how I'd evolve it:\n\n1. **Core Innovation**: Build this as a platform that not only delivers on "${idea}" but creates a network effect — each user interaction makes the system smarter and more valuable.\n\n2. **Viral Mechanic**: Add a collaborative layer where users can share their refined outputs, creating a public gallery of AI-enhanced ideas that attracts organic traffic.\n\n3. **Differentiation**: Most tools in this space are single-prompt, single-response. The multi-perspective approach gives you an unfair advantage — it's like having a board of advisors for the price of one.\n\n4. **Expansion Paths**: Start with ideation, then branch into decision-making, content creation, and strategic planning modules.\n\n5. **Emotional Hook**: Frame it as "your AI brain trust" — everyone wants a team of experts backing their ideas.`,
      `⚡ **Deep Dive: "${idea}"**\n\nLet me push this idea further:\n\n1. **The Big Picture**: This isn't just a tool — it's a new way of thinking. Imagine replacing hours of brainstorming with a 2-minute AI council session.\n\n2. **Feature Expansion**: Real-time collaboration where multiple users can submit ideas to the same council, creating a "battle of ideas" format.\n\n3. **AI Memory**: The council should remember past sessions and build on previous discussions, creating continuity like a real advisory board.\n\n4. **Template Library**: Pre-built council configurations for specific use cases — startup pitching, content strategy, product design, marketing campaigns.\n\n5. **Gamification**: Score ideas based on council consensus, creating a leaderboard of the best-refined concepts.`,
    ],
    pixel: [
      `🎨 **Creative Enhancement for "${idea}"**\n\nLet me add some creative magic:\n\n1. **Brand Storytelling**: Position this as "The Boardroom of the Future" — sleek, powerful, and slightly mysterious. The dark neon aesthetic should feel like stepping into a sci-fi command center.\n\n2. **Visual Identity**: Each agent should feel like a real character with personality. Nova should feel energetic and expansive, Cipher sharp and precise, Vector calculated and confident.\n\n3. **User Experience**: The sequential reveal of agent responses creates natural drama and anticipation. Add subtle sound design — a soft chime when each agent starts "speaking."\n\n4. **Content Format**: The final chairman summary should be exportable as a beautiful, branded one-pager that users would be proud to share.\n\n5. **Emotional Design**: Use progressive disclosure — reveal insights gradually to create an "unwrapping a gift" feeling. Each agent response should feel like a revelation.`,
      `✨ **Creative Layer for "${idea}"**\n\nHere's the creative vision:\n\n1. **Personality Design**: Give each AI agent a distinct communication style — Nova uses metaphors and bold language, Cipher uses data-driven precision, Pixel uses vivid descriptions.\n\n2. **Visual Storytelling**: Animate the council as a virtual meeting room where each agent "leans in" when it's their turn. Visual cues build engagement.\n\n3. **Shareability**: Create beautiful output cards optimized for social media — users will screenshot and share their AI Council results, driving organic growth.\n\n4. **Theming**: Let users customize the council aesthetic — corporate boardroom, creative studio, space station command deck.\n\n5. **Micro-interactions**: Every click, hover, and transition should feel premium. The typing indicator, the fade-in of responses, the glow effects — these details separate good from great.`,
    ],
    cipher: [
      `🔍 **Critical Analysis of "${idea}"**\n\nLet me stress-test this concept:\n\n1. **Risk: LLM Dependency** — The entire value proposition relies on AI quality. If responses feel generic or repetitive, users will churn fast. Mitigation: invest heavily in prompt engineering and allow users to provide context files.\n\n2. **Competitive Threat** — ChatGPT with custom instructions or multi-shot prompting can partially replicate this. Your moat must be UX, speed, and the structured multi-perspective format.\n\n3. **Scalability Concern** — Running 5 sequential LLM calls per session is expensive. At scale, you'll need caching strategies, response optimization, and tiered model selection.\n\n4. **User Retention** — The novelty factor is high but may fade. Solution: continuously add new agent types, allow custom agents, and build a community around shared councils.\n\n5. **Quality Control** — What if agents contradict each other in unhelpful ways? The Chairman agent needs robust synthesis logic to handle conflicting inputs gracefully.\n\n6. **Privacy** — Users may input sensitive business ideas. Clear data handling policies and optional local processing will be essential for enterprise adoption.`,
      `🔎 **Rigorous Analysis of "${idea}"**\n\nHere's my critical assessment:\n\n1. **Assumption Check**: We're assuming users want multiple perspectives rather than one optimal answer. Validate this — some users prefer decisive, single-voice responses.\n\n2. **Cost Economics**: 5 API calls per query = 5x the cost of a single-response tool. Your pricing needs to account for this while remaining competitive.\n\n3. **Latency Risk**: Sequential execution means users wait for all 5 agents. This could feel slow. Consider streaming responses or parallel processing with ordered display.\n\n4. **Differentiation Durability**: If this works, competitors will copy the multi-agent format. Your sustainable advantage must be brand, community, and accumulated UX refinement.\n\n5. **Edge Cases**: What about very short inputs? Very long inputs? Non-English inputs? Inappropriate content? Each needs a handling strategy.\n\n6. **Market Validation**: Before over-building, launch a minimal version and measure: Do users actually read all 5 responses, or do they skip to the Chairman?`,
    ],
    vector: [
      `📊 **Business Strategy for "${idea}"**\n\nHere's the market playbook:\n\n1. **Market Size**: The AI productivity tools market is projected at $30B+ by 2027. Multi-agent AI is an emerging category with first-mover advantage available.\n\n2. **Pricing Strategy**:\n   - Free: 3 councils/day, basic agents\n   - Pro ($19/mo): Unlimited councils, export features, custom agents\n   - Team ($49/mo): Shared workspaces, team history, API access\n   - Enterprise: Custom pricing, dedicated models, SSO\n\n3. **Go-to-Market**: Launch on Product Hunt, build a Twitter/X presence with daily "AI Council outputs" showcasing the product. Partner with productivity YouTubers.\n\n4. **Revenue Timeline**: Aim for $10K MRR within 6 months through targeted marketing to freelancers, content creators, and startup founders.\n\n5. **Competitive Positioning**: Not an AI chatbot, not a writing tool — position as "AI Advisory Board as a Service." This framing commands higher perceived value.\n\n6. **Growth Loops**: Shareable council outputs → social visibility → new users → more shared outputs. Build virality into the core product experience.`,
      `💼 **Strategic Analysis of "${idea}"**\n\nBusiness perspective:\n\n1. **Target Segments** (prioritized):\n   - Startup founders ideating on business models\n   - Content creators seeking multi-angle content ideas\n   - Marketing teams brainstorming campaigns\n   - Product managers validating feature ideas\n\n2. **Monetization Levers**:\n   - Subscription tiers (core revenue)\n   - API access for developers\n   - White-label licensing for enterprises\n   - Premium agent templates marketplace\n\n3. **Unit Economics**: At $19/mo Pro tier, you need ~530 subscribers for $10K MRR. With 3% conversion from free, you need ~17,700 free users. Achievable with strong Product Hunt launch + content marketing.\n\n4. **Strategic Partnerships**: Integrate with Notion, Slack, and project management tools. Become the "brainstorming layer" that plugs into existing workflows.\n\n5. **Defensibility**: Build user habit (daily council sessions), accumulate proprietary data on what makes effective councils, and develop specialized agents that competitors can't easily replicate.\n\n6. **Exit Potential**: AI productivity tools are hot acquisition targets. Build clean, modular architecture for potential acqui-hire or strategic acquisition.`,
    ],
    apex: [
      `👑 **CHAIRMAN'S FINAL VERDICT on "${idea}"**\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nAfter careful consideration of all council inputs, here is my synthesis:\n\n## Executive Summary\nThis concept is **STRONGLY VIABLE** with clear market demand, a compelling UX differentiator, and multiple revenue paths. The multi-agent approach is both the product and the marketing hook.\n\n## Key Decisions\n\n**✅ PROCEED with these priorities:**\n1. Launch MVP with 5 core agents and polished UX within 4 weeks\n2. Focus on the "wow factor" — the sequential reveal, the neon aesthetic, the premium feel\n3. Target startup founders and content creators first (they're vocal, they share)\n4. Price at $19/mo Pro tier with a generous free plan for virality\n\n**⚠️ MITIGATE these risks:**\n1. Invest in prompt engineering to avoid generic-feeling responses\n2. Implement streaming to reduce perceived latency\n3. Add usage analytics to understand which agents users actually value\n4. Build clear data privacy documentation from day one\n\n**📋 90-Day Roadmap:**\n- Week 1-4: MVP launch with core council + landing page\n- Week 5-8: Add custom agents, export features, templates\n- Week 9-12: Product Hunt launch, influencer partnerships, team features\n\n## The Bottom Line\nThis product fills a genuine gap between "ask ChatGPT once" and "hire a consulting team." The multi-perspective format creates unique value that's hard to replicate and easy to market. **Ship it.**\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `👑 **CHAIRMAN'S SYNTHESIS on "${idea}"**\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nHaving heard from all council members, here is my final assessment:\n\n## Verdict: GREEN LIGHT ✅\n\nThis concept demonstrates strong fundamentals across creativity, market fit, and technical feasibility.\n\n## Strategic Plan\n\n**Phase 1 — Foundation (Weeks 1-4):**\n- Ship MVP with the 5-agent council format\n- Focus on UX polish — this IS the differentiator\n- Implement free tier with 3 sessions/day\n\n**Phase 2 — Growth (Weeks 5-8):**\n- Launch on Product Hunt and Hacker News\n- Content marketing: share impressive council outputs daily\n- Add export features, session history, and templates\n\n**Phase 3 — Scale (Weeks 9-16):**\n- Custom agent builder (let users create their own council roles)\n- Team features and shared workspaces\n- API for developers and integrations\n\n## Critical Success Factors\n1. **Response Quality** — Generic outputs will kill retention. Invest in prompts.\n2. **Speed** — Nobody waits 30 seconds. Streaming is non-negotiable at scale.\n3. **Shareability** — Every output should look good enough to screenshot and tweet.\n4. **Community** — Build a following around the concept, not just the tool.\n\n## Financial Target\n- Month 3: 500 Pro subscribers → $9,500 MRR\n- Month 6: 1,500 Pro subscribers → $28,500 MRR\n- Month 12: 5,000 Pro subscribers → $95,000 MRR\n\n**The council is unanimous: this idea has legs. Execute with excellence.**\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    ],
  };

  const agentResponses = responses[agent.id] || responses.nova;
  const randomIndex = Math.floor(Math.random() * agentResponses.length);
  return agentResponses[randomIndex];
}

// ── Run the Full Council ─────────────────────────────

export async function runCouncil(idea) {
  const results = [];

  for (const agent of AGENTS) {
    // Simulate thinking time (300-800ms per agent)
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 500));

    const response = generateSimulatedResponse(agent, idea, results);
    results.push({
      agentId: agent.id,
      agent,
      message: response,
      timestamp: new Date().toISOString(),
    });
  }

  return results;
}

// ── Run Single Agent (for streaming UI) ──────────────

export async function runSingleAgent(agentIndex, idea, priorResponses = []) {
  const agent = AGENTS[agentIndex];
  if (!agent) return null;

  // Simulate thinking
  await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 1200));

  const response = generateSimulatedResponse(agent, idea, priorResponses);

  return {
    agentId: agent.id,
    agent,
    message: response,
    timestamp: new Date().toISOString(),
  };
}
