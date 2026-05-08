// Rotates through 14 content pillars matching the @stableadhd launch plan
const CAPTION_BRIEFS = [
  `Write an Instagram caption for @stableadhd (an ADHD productivity app). Pillar: Brand reveal. Theme: stability isn't the absence of chaos — it's knowing how to move through it. Tone: quiet, inevitable, warm. 3 short paragraphs, no emojis in body, one em dash before the CTA line "📱 link in bio → stableadhd.com". End with 8 relevant hashtags on a new line after a blank line.`,

  `Write an Instagram caption for @stableadhd. Pillar: Emotional validation. Theme: you're not lazy, you're not broken — your brain runs a different OS. Tone: deeply empathetic, no toxic positivity. 3 short paragraphs. End with "save this if it hit something." then 8 hashtags including #ADHDadults #neurodivergent #latediagnosis.`,

  `Write an Instagram caption for @stableadhd. Pillar: App feature — tasks. Theme: task paralysis is real, not procrastination. stable. breaks tasks into sizes your brain can actually start. Tone: informative and gentle. 3 paragraphs. CTA: "try it free → link in bio". 8 hashtags.`,

  `Write an Instagram caption for @stableadhd. Pillar: ADHD education. Theme: the neuroscience of task paralysis — dopamine and why deadlines help but aren't sustainable. Tone: educational, credible, empathetic. 4 short paragraphs. End with "💾 save this for the next time someone tells you to just do it". 8 hashtags including #dopamine #ADHDeducation.`,

  `Write an Instagram caption for @stableadhd. Pillar: Emotional validation. Theme: the ADHD overwhelm loop — everything matters, nothing gets done, can't start until I know where to start. stable. gives your brain a landing strip. Tone: validating, not preachy. 3 paragraphs. End with "does this loop feel familiar? reply below". 8 hashtags.`,

  `Write an Instagram caption for @stableadhd. Pillar: Self-compassion and rest. Theme: rest is not a reward for finishing — it's a requirement for functioning. ADHD brains work harder just to keep up. Tone: tender, permission-giving. 3 paragraphs. End with "rest today. without a reason." 8 hashtags including #selfcompassion #burnout.`,

  `Write an Instagram caption for @stableadhd. Pillar: Focus systems. Theme: the 5-minute focus protocol — focus comes from removing decisions, not motivation. stable. handles the structure. Tone: practical, actionable. 3 paragraphs. End with "📌 save this. you'll need it." 8 hashtags including #ADHDfocus #deepwork.`,

  `Write an Instagram caption for @stableadhd. Pillar: App feature — mood tracking. Theme: your ADHD mood isn't random — there are patterns. stable. helps you find them so you can plan around them. Tone: insightful, calm. 3 paragraphs. CTA: "try stable. free → link in bio". 8 hashtags.`,

  `Write an Instagram caption for @stableadhd. Pillar: Morning routines. Theme: a real morning routine for ADHD — not 5am cold plunges. 3 flexible habits in any order. Tone: realistic, forgiving, human. 3 paragraphs. End with "what's one morning habit you've actually kept? drop it below 👇" 8 hashtags.`,

  `Write an Instagram caption for @stableadhd. Pillar: ADHD tax. Theme: the ADHD tax no one talks about — late fees, forgotten subscriptions, hours of re-explaining yourself. This is executive dysfunction, not a character flaw. stable. reduces the tax. Tone: measured, empathetic, never accusatory. 4 paragraphs. 8 hashtags.`,

  `Write an Instagram caption for @stableadhd. Pillar: Hyperfocus. Theme: hyperfocus is real — you can spend 6 hours on something and forget to eat. stable. includes gentle time checks during focus sessions so you don't disappear. Tone: knowing, warm, slightly wry. 3 paragraphs. 8 hashtags.`,

  `Write an Instagram caption for @stableadhd. Pillar: Late diagnosis. Theme: being diagnosed as an adult ADHD — the grief, the relief, the understanding of why things were so hard. stable. was designed with late-diagnosed adults in mind. Tone: validating, hopeful. 4 paragraphs. End with "if this is you — you're not alone." 8 hashtags including #latediagnosis #ADHDwomen #ADHDmen.`,

  `Write an Instagram caption for @stableadhd. Pillar: App CTA. Theme: tasks, focus sessions, mood tracking, reminders — all built for the ADHD brain, designed to feel calm. Free to start, no card required. Tone: confident, minimal. 3 short paragraphs. CTA: "↓ link in bio". End with "if you know someone who needs this — send it to them." 8 hashtags.`,

  `Write an Instagram caption for @stableadhd. Pillar: Body doubling and community. Theme: ADHD brains focus better with others present — body doubling is real and effective. We're building a body-doubling feature in stable. Tone: community-first, inviting. 3 paragraphs. End with "would you use a body-doubling room? tell us below." 8 hashtags.`,
]

function getDaySlot(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86_400_000)
  // AM slot = even index, PM slot = odd index — so each day uses two different briefs
  const isAfternoon = now.getUTCHours() >= 12 ? 1 : 0
  return (dayOfYear * 2 + isAfternoon) % CAPTION_BRIEFS.length
}

export async function generateCaption(): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY must be set')

  const brief = CAPTION_BRIEFS[getDaySlot()]

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{ role: 'user', content: brief }],
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Anthropic API error ${res.status}: ${text}`)
  }

  const data = await res.json() as { content: Array<{ text: string }> }
  return data.content[0].text
}
