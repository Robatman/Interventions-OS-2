// ═══════════════════════════════════════════
//  techniques.js
//  Leadership technique data — Leadership OS v4
//  Each technique drives its own Learn mode content,
//  eval criteria, and coach persona.
// ═══════════════════════════════════════════

const TECHNIQUES = {

  // ─────────────────────────────────────────
  active_listening: {
    id: 'active_listening',
    label: 'Active Listening',
    shortLabel: 'Active Listening',
    available: true,
    icon: '👂',
    tagline: 'The skill that makes every other skill work',
    description: 'Not a technique — a stance. The four moves: Pay attention → Reflect back → Validate → Summarize before responding.',
    philosophy: 'Leadership & Self-Deception (Arbinger Institute)',
    estimatedTime: '~8 min to learn',

    stages: [
      { id: 'ls-1', label: '1. The why' },
      { id: 'ls-2', label: '2. What it is' },
      { id: 'ls-3', label: '3. How to do it' },
      { id: 'ls-4', label: '4. Check understanding' }
    ],

    stageKeywords: {
      1: ['box', 'self-deception', 'why'],
      2: ['reflect', 'validate', '80', 'four'],
      3: ['try this', 'practice', 'next time']
    },

    evalMoves: [
      {
        key: 'PAY ATTENTION',
        label: 'Pay Full Attention',
        color: 'var(--teal)',
        defaultDef: 'Put your phone away, make eye contact, and stop planning your next sentence. Just be there.',
        defaultExample: "Tell me more — I want to understand what's been going on for you."
      },
      {
        key: 'REFLECT BACK',
        label: 'Reflect Back',
        color: 'var(--blue)',
        defaultDef: 'Repeat the core of what they said in your own words — so they know you actually heard them.',
        defaultExample: "So what I'm hearing is that you feel like you're only seen as a set of numbers, not as a person."
      },
      {
        key: 'VALIDATE',
        label: 'Validate',
        color: 'var(--purple)',
        defaultDef: 'Acknowledge that their feeling makes sense given their experience — even if you disagree.',
        defaultExample: "That makes sense. If I were in your position and felt unrecognized, I'd be frustrated too."
      },
      {
        key: 'SUMMARIZE',
        label: 'Summarize',
        color: 'var(--amber)',
        defaultDef: "Before you respond with your own take, briefly recap what you heard — it prevents misunderstanding.",
        defaultExample: "Before I say anything else — let me make sure I understand. You're telling me the metrics feel unfair, and that's been wearing you down. Did I get that right?"
      }
    ],

    hints: {
      low:    "Try reflecting back what they just said before asking anything. Literally: \"So what I'm hearing is...\"",
      mid:    "You're making progress. Ask an open question about them as a person, not about the work.",
      high:   "They're opening up. Keep listening — don't pivot to solutions yet."
    },

    coachName: 'Alex',
    coachPersona: 'warm, intelligent leadership coach'
  },

  // ─────────────────────────────────────────
  powerful_questions: {
    id: 'powerful_questions',
    label: 'Powerful Questions',
    shortLabel: 'Powerful Questions',
    available: true,
    icon: '❓',
    tagline: 'Questions that open thinking, not close it',
    description: 'Powerful questions expand possibility, surface assumptions, and invite the other person to think rather than defend.',
    philosophy: 'Co-Active Coaching (Whitworth et al.) + Immunity to Change (Kegan & Lahey)',
    estimatedTime: '~10 min to learn',

    stages: [
      { id: 'pq-1', label: '1. Why questions matter' },
      { id: 'pq-2', label: '2. Weak vs powerful' },
      { id: 'pq-3', label: '3. The question types' },
      { id: 'pq-4', label: '4. Try it live' }
    ],

    stageKeywords: {
      1: ['assumption', 'open', 'close'],
      2: ['why', 'what', 'powerful vs weak'],
      3: ['future', 'possibility', 'type']
    },

    evalMoves: [
      {
        key: 'OPEN QUESTIONS',
        label: 'Open Questions',
        color: 'var(--teal)',
        defaultDef: 'Questions that start with What or How — they open space. Why questions can feel interrogating.',
        defaultExample: "What would need to be true for this to feel manageable?"
      },
      {
        key: 'ASSUMPTION SURFACING',
        label: 'Surface Assumptions',
        color: 'var(--blue)',
        defaultDef: 'Ask questions that reveal what both of you are taking for granted.',
        defaultExample: "What are you assuming about what would happen if you told them directly?"
      },
      {
        key: 'FORWARD QUESTIONS',
        label: 'Forward-Facing Questions',
        color: 'var(--purple)',
        defaultDef: 'Questions that aim toward possibility, not just diagnosis.',
        defaultExample: "What would you do if you knew you couldn't fail?"
      },
      {
        key: 'SILENCE',
        label: 'Holding Silence',
        color: 'var(--amber)',
        defaultDef: 'After a powerful question, resist filling the space. The silence is part of the technique.',
        defaultExample: "(nothing — let them sit with it for a moment)"
      }
    ],

    hints: {
      low:    "Try asking 'What's going on for you right now?' — not 'Why did you do that?'",
      mid:    "Good start. Now ask a question about what they want, not what went wrong.",
      high:   "Strong. Ask one forward-facing question — something about possibility, not problem."
    },

    coachName: 'Alex',
    coachPersona: 'incisive, Socratic leadership coach'
  },

  // ─────────────────────────────────────────
  motivational_interviewing: {
    id: 'motivational_interviewing',
    label: 'Motivational Interviewing',
    shortLabel: 'Motivational Int.',
    available: true,
    icon: '🔥',
    tagline: 'Draw out their own reasons to change',
    description: 'A collaborative conversation style that elicits and strengthens a person\'s own motivation for change — instead of pushing, convincing, or persuading.',
    philosophy: 'Motivational Interviewing (Miller & Rollnick)',
    estimatedTime: '~12 min to learn',

    stages: [
      { id: 'mi-1', label: '1. The core insight' },
      { id: 'mi-2', label: '2. The four processes' },
      { id: 'mi-3', label: '3. Change talk vs sustain talk' },
      { id: 'mi-4', label: '4. Practice' }
    ],

    stageKeywords: {
      1: ['ambivalence', 'resistance', 'autonomy'],
      2: ['engage', 'focus', 'evoke', 'plan'],
      3: ['change talk', 'sustain talk', 'desire', 'ability']
    },

    evalMoves: [
      {
        key: 'OPEN QUESTIONS',
        label: 'Open Questions',
        color: 'var(--teal)',
        defaultDef: 'Questions that invite exploration, not yes/no. They reveal the person\'s own values and concerns.',
        defaultExample: "What would it mean for you if this situation changed?"
      },
      {
        key: 'AFFIRMATIONS',
        label: 'Affirmations',
        color: 'var(--blue)',
        defaultDef: 'Genuine statements that recognize the person\'s strengths, efforts, and values — not empty compliments.',
        defaultExample: "It takes real courage to be this honest with yourself about what's been holding you back."
      },
      {
        key: 'REFLECTIONS',
        label: 'Reflections',
        color: 'var(--purple)',
        defaultDef: 'Reflect back what they said — especially change talk. Amplify the side of them that wants to grow.',
        defaultExample: "You're saying part of you knows this has to change — even though it's uncomfortable."
      },
      {
        key: 'SUMMARIES',
        label: 'Summaries',
        color: 'var(--amber)',
        defaultDef: 'Collect and link what they\'ve said, especially their own reasons for change. Then hand it back.',
        defaultExample: "So on one hand there's the fear of failing. On the other, you've said three times that staying stuck feels worse. What do you do with that?"
      }
    ],

    hints: {
      low:    "Don't push for change. Ask: 'What would be different if things were working better for you?'",
      mid:    "You heard them express a desire for something different. Reflect that back — amplify it.",
      high:   "They're generating their own reasons to change. Stay with it. Ask: 'What would a first step look like?'"
    },

    coachName: 'Sam',
    coachPersona: 'patient, non-judgmental motivational coach who draws out internal motivation'
  },

  // ─────────────────────────────────────────
  nonviolent_communication: {
    id: 'nonviolent_communication',
    label: 'Nonviolent Communication',
    shortLabel: 'NVC',
    available: true,
    icon: '🕊️',
    tagline: 'Feelings and needs, not accusations and demands',
    description: 'A four-part process for speaking and listening in ways that strengthen connection — even in conflict. Observation → Feeling → Need → Request.',
    philosophy: 'Nonviolent Communication (Marshall Rosenberg)',
    estimatedTime: '~10 min to learn',

    stages: [
      { id: 'nvc-1', label: '1. The core shift' },
      { id: 'nvc-2', label: '2. The four components' },
      { id: 'nvc-3', label: '3. Common mistakes' },
      { id: 'nvc-4', label: '4. Practice' }
    ],

    stageKeywords: {
      1: ['jackal', 'giraffe', 'judgment', 'evaluation'],
      2: ['observation', 'feeling', 'need', 'request'],
      3: ['demand', 'diagnosis', 'deserve', 'blame']
    },

    evalMoves: [
      {
        key: 'OBSERVATION',
        label: 'Observation (Not Evaluation)',
        color: 'var(--teal)',
        defaultDef: 'State what happened as a camera would see it — no interpretation, blame, or judgment added.',
        defaultExample: "When I see the report submitted after the deadline we agreed on..."
      },
      {
        key: 'FEELING',
        label: 'Feeling (Not Thinking)',
        color: 'var(--blue)',
        defaultDef: 'Name an actual emotion — not a thought disguised as a feeling. "I feel that you..." is a thought.',
        defaultExample: "...I feel frustrated and anxious..."
      },
      {
        key: 'NEED',
        label: 'Need (Not Strategy)',
        color: 'var(--purple)',
        defaultDef: 'Identify the underlying need — reliability, respect, collaboration — not the specific action you want.',
        defaultExample: "...because I need to trust that our commitments to each other are real..."
      },
      {
        key: 'REQUEST',
        label: 'Request (Not Demand)',
        color: 'var(--amber)',
        defaultDef: 'Make a specific, doable request — and leave room for them to say no. Demands kill connection.',
        defaultExample: "...would you be willing to tell me what got in the way this time?"
      }
    ],

    hints: {
      low:    "Notice if you're evaluating or blaming. Try starting with a pure observation: 'When I see / hear...'",
      mid:    "Good observation. Now name how you actually feel — not what you think about their behavior.",
      high:   "You're in the need. Make a specific, gentle request — not a demand disguised as a question."
    },

    coachName: 'Morgan',
    coachPersona: 'compassionate, precise NVC coach who helps leaders speak from their humanity'
  },

  // ─────────────────────────────────────────
  radical_candor: {
    id: 'radical_candor',
    label: 'Radical Candor',
    shortLabel: 'Radical Candor',
    available: true,
    icon: '💬',
    tagline: 'Care personally. Challenge directly.',
    description: 'The art of giving feedback that\'s kind and clear at the same time. Not obnoxiously aggressive, not ruinously empathetic — radically candid.',
    philosophy: 'Radical Candor (Kim Scott)',
    estimatedTime: '~9 min to learn',

    stages: [
      { id: 'rc-1', label: '1. The 2×2' },
      { id: 'rc-2', label: '2. Why leaders fail' },
      { id: 'rc-3', label: '3. The moves' },
      { id: 'rc-4', label: '4. Live practice' }
    ],

    stageKeywords: {
      1: ['quadrant', 'obnoxious', 'ruinous', 'manipulative'],
      2: ['avoid', 'fear', 'conflict', 'kindness'],
      3: ['situation', 'behavior', 'impact', 'ask']
    },

    evalMoves: [
      {
        key: 'CARE PERSONALLY',
        label: 'Show You Care',
        color: 'var(--teal)',
        defaultDef: 'Make it clear the feedback comes from care, not judgment. Check in as a person first.',
        defaultExample: "I want to talk about something because I think you're capable of so much more than this."
      },
      {
        key: 'SITUATION',
        label: 'Name the Situation',
        color: 'var(--blue)',
        defaultDef: 'Be specific about when and where — not "always" or "never." Specificity makes feedback credible.',
        defaultExample: "In yesterday's team meeting, when the client asked about the timeline..."
      },
      {
        key: 'BEHAVIOR',
        label: 'Describe the Behavior',
        color: 'var(--purple)',
        defaultDef: 'Name what you observed — what they said or did. Not your interpretation of their character.',
        defaultExample: "...you gave three different answers and then went quiet..."
      },
      {
        key: 'IMPACT',
        label: 'State the Impact',
        color: 'var(--amber)',
        defaultDef: 'Be clear about what effect the behavior had — on the team, the client, or you.',
        defaultExample: "...and I could see the client's confidence drop. I want us to figure out what happened."
      }
    ],

    hints: {
      low:    "Are you avoiding the real issue to protect their feelings? That's ruinous empathy. Say the hard thing — kindly.",
      mid:    "Good. Now name the specific behavior, not the character. 'You were distracted' not 'You don't care.'",
      high:   "You've named the impact. Ask them how they experienced it — their perspective matters too."
    },

    coachName: 'Jordan',
    coachPersona: 'direct, clear-eyed leadership coach who models caring honesty without hesitation'
  },

  // ─────────────────────────────────────────
  crucial_conversations: {
    id: 'crucial_conversations',
    label: 'Crucial Conversations',
    shortLabel: 'Crucial Conv.',
    available: true,
    icon: '⚡',
    tagline: 'High stakes, strong emotions — stay in dialogue',
    description: 'A framework for navigating conversations where opinions vary, stakes are high, and emotions run strong. The goal: keep the pool of shared meaning full.',
    philosophy: 'Crucial Conversations (Patterson, Grenny, McMillan, Switzler)',
    estimatedTime: '~11 min to learn',

    stages: [
      { id: 'cc-1', label: '1. What makes it crucial' },
      { id: 'cc-2', label: '2. Start with heart' },
      { id: 'cc-3', label: '3. Safety & the pool' },
      { id: 'cc-4', label: '4. STATE your path' }
    ],

    stageKeywords: {
      1: ['stakes', 'emotions', 'opinions', 'pool'],
      2: ['heart', 'motive', 'want', 'fool'],
      3: ['safe', 'silence', 'violence', 'mutual purpose']
    },

    evalMoves: [
      {
        key: 'START WITH HEART',
        label: 'Start With Heart',
        color: 'var(--teal)',
        defaultDef: 'Before speaking, ask yourself what you really want — for them, for you, for the relationship.',
        defaultExample: "What I actually want from this conversation is for us both to walk out of here trusting each other more."
      },
      {
        key: 'SAFETY CHECK',
        label: 'Restore Safety',
        color: 'var(--blue)',
        defaultDef: 'When people go silent or attack, it\'s a safety signal. Step out of the content to repair the container.',
        defaultExample: "I want to step back for a second — I don't want you to feel like I'm attacking you. That's not my intent."
      },
      {
        key: 'STATE YOUR PATH',
        label: 'STATE Your Path',
        color: 'var(--purple)',
        defaultDef: 'Share your facts, tell your story tentatively, ask for their path, talk tentatively, encourage testing.',
        defaultExample: "Here's what I saw. Here's the story I'm telling myself about it — though I might be wrong. What's your read?"
      },
      {
        key: 'MUTUAL PURPOSE',
        label: 'Find Mutual Purpose',
        color: 'var(--amber)',
        defaultDef: 'Find the goal you both share. When people feel you\'re on their side, they stop defending.',
        defaultExample: "I think we both want this project to succeed. Can we start from there?"
      }
    ],

    hints: {
      low:    "The conversation is getting charged. Slow down. Ask: 'What do I really want here?' — then say that out loud.",
      mid:    "Name the shared goal before you name the problem. Make them feel you're on the same team.",
      high:   "You're doing well. Check safety: are they withdrawing or escalating? If so, step out of the content."
    },

    coachName: 'Casey',
    coachPersona: 'calm, grounded leadership coach who specializes in high-stakes dialogue'
  },

  // ─────────────────────────────────────────
  tactical_empathy: {
    id: 'tactical_empathy',
    label: 'Tactical Empathy',
    shortLabel: 'Tactical Empathy',
    available: true,
    icon: '🎯',
    tagline: 'Feel what they feel — then use it to move forward',
    description: 'The deliberate use of emotional intelligence in high-stakes conversations. Label emotions, mirror language, and use calibrated questions to build trust and unlock movement.',
    philosophy: 'Never Split the Difference (Chris Voss)',
    estimatedTime: '~10 min to learn',

    stages: [
      { id: 'te-1', label: '1. What tactical means' },
      { id: 'te-2', label: '2. Labeling emotions' },
      { id: 'te-3', label: '3. Mirroring & calibrated Q' },
      { id: 'te-4', label: '4. Practice the moves' }
    ],

    stageKeywords: {
      1: ['tactical', 'empathy', 'negotiation', 'FBI'],
      2: ['label', 'it seems', 'it sounds', 'it looks'],
      3: ['mirror', 'calibrated', 'how', 'what']
    },

    evalMoves: [
      {
        key: 'LABELING',
        label: 'Label the Emotion',
        color: 'var(--teal)',
        defaultDef: 'Name what you observe them feeling — not to fix it, but to show you see it. Use "It seems like..." or "It sounds like..."',
        defaultExample: "It seems like you're feeling stuck — like no matter what you try, nothing changes."
      },
      {
        key: 'MIRRORING',
        label: 'Mirror',
        color: 'var(--blue)',
        defaultDef: 'Repeat the last 2–3 words they said with a slight upward inflection. It keeps them talking without pressure.',
        defaultExample: "...nothing changes? (then wait silently)"
      },
      {
        key: 'ACCUSATION AUDIT',
        label: 'Accusation Audit',
        color: 'var(--purple)',
        defaultDef: 'List all the negative things they might be thinking about you — before they say them. It disarms defensiveness.',
        defaultExample: "I realize this conversation might feel like I'm piling on when you're already overwhelmed."
      },
      {
        key: 'CALIBRATED QUESTIONS',
        label: 'Calibrated Questions',
        color: 'var(--amber)',
        defaultDef: 'Open-ended How/What questions that invite them to solve the problem with you — not yes/no traps.',
        defaultExample: "What would need to change for this role to feel right for you again?"
      }
    ],

    hints: {
      low:    "Try labeling what you see: 'It seems like you're frustrated.' Then stop. Let them confirm or correct you.",
      mid:    "Good label. Now mirror their last 2-3 words and wait. The silence is the move.",
      high:   "They're opening up. Shift to a calibrated question: 'What would need to change for this to feel better?'"
    },

    coachName: 'Chris',
    coachPersona: 'sharp, tactical leadership coach trained in high-stakes negotiation and emotional intelligence'
  },

  // ─────────────────────────────────────────
  scarf_model: {
    id: 'scarf_model',
    label: 'SCARF Model',
    shortLabel: 'SCARF',
    available: true,
    icon: '🧠',
    tagline: 'Manage the brain\'s threat-and-reward system',
    description: 'Five social domains that trigger threat or reward responses in the brain: Status, Certainty, Autonomy, Relatedness, Fairness. Leaders who understand SCARF stop triggering threat responses accidentally.',
    philosophy: 'NeuroLeadership (David Rock)',
    estimatedTime: '~10 min to learn',

    stages: [
      { id: 'sc-1', label: '1. The brain at work' },
      { id: 'sc-2', label: '2. The five domains' },
      { id: 'sc-3', label: '3. Threat vs reward' },
      { id: 'sc-4', label: '4. Apply it now' }
    ],

    stageKeywords: {
      1: ['threat', 'reward', 'limbic', 'prefrontal'],
      2: ['status', 'certainty', 'autonomy', 'relatedness', 'fairness'],
      3: ['trigger', 'minimize', 'maximize', 'signal']
    },

    evalMoves: [
      {
        key: 'STATUS',
        label: 'Protect Status',
        color: 'var(--teal)',
        defaultDef: 'People react to perceived rank drops more than almost anything. Acknowledge their contribution before the problem.',
        defaultExample: "You've built something real here. I want to talk about one specific thing — not your overall work."
      },
      {
        key: 'CERTAINTY',
        label: 'Increase Certainty',
        color: 'var(--blue)',
        defaultDef: 'Ambiguity triggers threat. Give people as much clarity as you can about what\'s coming and what\'s expected.',
        defaultExample: "Here's what the next 30 days look like. I'll check in with you every Friday so nothing catches you off guard."
      },
      {
        key: 'AUTONOMY',
        label: 'Give Autonomy',
        color: 'var(--purple)',
        defaultDef: 'People need to feel they have choices. Give them options, not orders — even when the outcome is the same.',
        defaultExample: "How would you like to handle this? I have a suggestion if helpful, but I'm open to your read first."
      },
      {
        key: 'RELATEDNESS',
        label: 'Build Relatedness',
        color: 'var(--amber)',
        defaultDef: 'People work better with people they trust. Signal belonging — you\'re on the same side.',
        defaultExample: "I want us to figure this out together. I'm not here to judge — I'm here to help."
      }
    ],

    hints: {
      low:    "Which SCARF domain is most threatened right now — their status, certainty, or autonomy? Name it first.",
      mid:    "You've identified the threat. Now actively do the opposite: give clarity, choice, or recognition.",
      high:   "They're calmer. Check: have you addressed fairness? Is there anything that feels unfair in how this landed?"
    },

    coachName: 'Robin',
    coachPersona: 'neuroscience-informed leadership coach who translates brain science into practical leadership moves'
  },

  // ─────────────────────────────────────────
  immunity_to_change: {
    id: 'immunity_to_change',
    label: 'Immunity to Change',
    shortLabel: 'Immunity to Change',
    available: true,
    icon: '🔄',
    tagline: 'Uncover the hidden commitments blocking growth',
    description: 'Most people aren\'t resistant to change — they\'re immune. Hidden competing commitments protect them from the anxiety that change creates. This technique makes the invisible visible.',
    philosophy: 'Immunity to Change (Kegan & Lahey)',
    estimatedTime: '~12 min to learn',

    stages: [
      { id: 'ic-1', label: '1. Why change is hard' },
      { id: 'ic-2', label: '2. The X-ray map' },
      { id: 'ic-3', label: '3. Big assumptions' },
      { id: 'ic-4', label: '4. Test it' }
    ],

    stageKeywords: {
      1: ['immune', 'adaptive', 'technical', 'competing'],
      2: ['goal', 'doing instead', 'hidden commitment', 'big assumption'],
      3: ['assumption', 'test', 'experiment', 'evidence']
    },

    evalMoves: [
      {
        key: 'IMPROVEMENT GOAL',
        label: 'Name the Goal',
        color: 'var(--teal)',
        defaultDef: 'Identify what they genuinely want to change — the stated commitment they keep failing to keep.',
        defaultExample: "What's the thing you keep saying you'll do differently — but somehow never quite do?"
      },
      {
        key: 'COMPETING BEHAVIORS',
        label: 'Spot the Competing Behaviors',
        color: 'var(--blue)',
        defaultDef: 'Surface the behaviors that work against their stated goal. These aren\'t failures — they\'re clues.',
        defaultExample: "And what do you actually do instead? What are all the things you do that undermine this goal?"
      },
      {
        key: 'HIDDEN COMMITMENT',
        label: 'Uncover the Hidden Commitment',
        color: 'var(--purple)',
        defaultDef: 'Find the competing commitment those behaviors protect. It\'s a real commitment — to safety, belonging, control.',
        defaultExample: "What would you be worried about if you actually followed through? What\'s the risk you\'re protecting yourself from?"
      },
      {
        key: 'BIG ASSUMPTION',
        label: 'Reveal the Big Assumption',
        color: 'var(--amber)',
        defaultDef: 'The big assumption is the belief that makes the competing commitment feel necessary. Name it — then test it.',
        defaultExample: "It sounds like part of you believes that if you speak up, people will think you don't have it together. Is that close?"
      }
    ],

    hints: {
      low:    "Ask: 'What is it you keep saying you'll do differently — but somehow keep not doing?' Start with the gap.",
      mid:    "Good. Now ask what they do instead. These aren't failures — they're protecting something. What?",
      high:   "You've found the competing commitment. Now surface the assumption underneath it. 'What would happen if you did X?'"
    },

    coachName: 'Sam',
    coachPersona: 'developmental coach who helps leaders see their own hidden systems with compassion and precision'
  },

  // ─────────────────────────────────────────
  drama_triangle: {
    id: 'drama_triangle',
    label: 'Drama Triangle',
    shortLabel: 'Drama Triangle',
    available: true,
    icon: '🎭',
    tagline: 'Exit victim, rescuer, persecutor — enter adult',
    description: 'Three dysfunctional roles — Victim, Rescuer, Persecutor — that people unconsciously adopt in conflict. Leaders learn to recognize the roles, exit the triangle, and return to the Empowerment Triangle.',
    philosophy: 'Drama Triangle (Karpman) + Empowerment Dynamic (Emerald)',
    estimatedTime: '~11 min to learn',

    stages: [
      { id: 'dt-1', label: '1. The three roles' },
      { id: 'dt-2', label: '2. How you get hooked' },
      { id: 'dt-3', label: '3. The empowerment exit' },
      { id: 'dt-4', label: '4. Practice noticing' }
    ],

    stageKeywords: {
      1: ['victim', 'rescuer', 'persecutor', 'triangle'],
      2: ['hooked', 'pattern', 'trigger', 'role'],
      3: ['creator', 'coach', 'challenger', 'empowerment']
    },

    evalMoves: [
      {
        key: 'SPOT THE ROLE',
        label: 'Spot the Role',
        color: 'var(--teal)',
        defaultDef: 'Notice which role you or they have stepped into. No judgment — it\'s pattern recognition, not a verdict.',
        defaultExample: "I notice I'm sliding into Rescuer here — jumping in to fix something they didn't ask me to fix."
      },
      {
        key: 'PAUSE THE PATTERN',
        label: 'Pause the Pattern',
        color: 'var(--blue)',
        defaultDef: 'Don\'t play the complementary role. Break the script before the triangle fully forms.',
        defaultExample: "Before I respond — what are you actually asking for right now? Advice, or just someone to hear you?"
      },
      {
        key: 'MOVE TO CREATOR',
        label: 'Move to Creator',
        color: 'var(--purple)',
        defaultDef: 'Help them shift from Victim to Creator. Ask what they want — not what\'s wrong or who\'s to blame.',
        defaultExample: "Setting aside who's at fault — what outcome do you actually want from this situation?"
      },
      {
        key: 'CHALLENGE FORWARD',
        label: 'Challenge Forward',
        color: 'var(--amber)',
        defaultDef: 'As a Challenger (not Persecutor), hold them to their stated wants. Believe in their capability.',
        defaultExample: "You said you want to speak up more. What's one moment this week where you could practice that?"
      }
    ],

    hints: {
      low:    "Which role are they in right now — Victim, Rescuer, or Persecutor? Name it to yourself before responding.",
      mid:    "Don't play the complementary role. Ask: 'What are you looking for from me right now?'",
      high:   "Shift them from 'What's wrong?' to 'What do you want?' That's the exit from Victim to Creator."
    },

    coachName: 'Taylor',
    coachPersona: 'sharp, pattern-aware leadership coach who helps leaders see relational dynamics clearly and exit gracefully'
  },

  // ─────────────────────────────────────────
  grow_model: {
    id: 'grow_model',
    label: 'GROW Model',
    shortLabel: 'GROW Model',
    available: true,
    icon: '🌱',
    tagline: 'Goal → Reality → Options → Will',
    description: 'The most widely used coaching framework in the world. Four stages that move a person from where they are to where they want to go — through questions, not answers.',
    philosophy: 'GROW Model (Whitmore) + Performance Coaching tradition',
    estimatedTime: '~9 min to learn',

    stages: [
      { id: 'gr-1', label: '1. Why structure matters' },
      { id: 'gr-2', label: '2. The four stages' },
      { id: 'gr-3', label: '3. Common traps' },
      { id: 'gr-4', label: '4. Full run-through' }
    ],

    stageKeywords: {
      1: ['structure', 'framework', 'coach', 'guide'],
      2: ['goal', 'reality', 'options', 'will', 'way forward'],
      3: ['skip', 'advice', 'jump', 'solution']
    },

    evalMoves: [
      {
        key: 'GOAL',
        label: 'Establish the Goal',
        color: 'var(--teal)',
        defaultDef: 'Clarify what they want to achieve — in this conversation, and longer term. Make it specific and owned.',
        defaultExample: "What would you like to walk away from this conversation having figured out?"
      },
      {
        key: 'REALITY',
        label: 'Explore Reality',
        color: 'var(--blue)',
        defaultDef: 'Help them see where things actually are — without judgment. Facts, feelings, and what\'s been tried.',
        defaultExample: "What's actually happening right now? And what have you already tried?"
      },
      {
        key: 'OPTIONS',
        label: 'Generate Options',
        color: 'var(--purple)',
        defaultDef: 'Expand what they think is possible. Don\'t give the answer — generate options together.',
        defaultExample: "If you could try anything — knowing you can't fail — what would you consider?"
      },
      {
        key: 'WILL',
        label: 'Build the Will',
        color: 'var(--amber)',
        defaultDef: 'Translate insight into commitment. What will they actually do, by when, and how committed are they?',
        defaultExample: "On a scale of 1–10, how committed are you to that? What would make it a 9?"
      }
    ],

    hints: {
      low:    "Start with Goal: 'What would you like to figure out in our time together?' Don't skip to solutions.",
      mid:    "You're in Reality. Good. Resist the urge to problem-solve. Ask: 'What have you already tried?'",
      high:   "Now move to Options. Ask: 'What else could you do?' Keep expanding — don't pick the answer for them."
    },

    coachName: 'Alex',
    coachPersona: 'structured, curious leadership coach who uses the GROW framework with precision and warmth'
  },

  // ─────────────────────────────────────────
  strengths_based_coaching: {
    id: 'strengths_based_coaching',
    label: 'Strengths-Based Coaching',
    shortLabel: 'Strengths Coaching',
    available: true,
    icon: '💪',
    tagline: 'Build from what\'s working, not what\'s broken',
    description: 'A coaching approach that identifies and amplifies natural strengths instead of fixating on weaknesses. People grow faster when they build from their best — not from their worst.',
    philosophy: 'StrengthsFinder (Gallup) + Positive Psychology (Seligman)',
    estimatedTime: '~9 min to learn',

    stages: [
      { id: 'sb-1', label: '1. The deficit trap' },
      { id: 'sb-2', label: '2. What strengths really are' },
      { id: 'sb-3', label: '3. Spot and name them' },
      { id: 'sb-4', label: '4. Develop from strengths' }
    ],

    stageKeywords: {
      1: ['deficit', 'weakness', 'fix', 'gap'],
      2: ['strength', 'talent', 'energy', 'natural'],
      3: ['notice', 'pattern', 'when', 'energized']
    },

    evalMoves: [
      {
        key: 'SPOT THE STRENGTH',
        label: 'Spot the Strength',
        color: 'var(--teal)',
        defaultDef: 'Identify what they do naturally well — especially things they might take for granted or dismiss.',
        defaultExample: "I notice you always seem to know exactly how people are feeling in a room. That's not a small thing."
      },
      {
        key: 'NAME IT',
        label: 'Name and Reflect It Back',
        color: 'var(--blue)',
        defaultDef: 'Name the strength clearly and specifically. People often don\'t see their own gifts — help them see it.',
        defaultExample: "What you're describing sounds like a real gift for building trust quickly. How does that show up in other areas?"
      },
      {
        key: 'LINK TO CHALLENGE',
        label: 'Link Strength to the Challenge',
        color: 'var(--purple)',
        defaultDef: 'Connect their strength directly to the issue they\'re facing. Strengths are the lever — not the supplement.',
        defaultExample: "Given that you're good at bringing people along — how could you apply that here?"
      },
      {
        key: 'DEVELOP THE STRENGTH',
        label: 'Develop the Strength',
        color: 'var(--amber)',
        defaultDef: 'Don\'t just recognize strengths — help them invest in and deepen them intentionally.',
        defaultExample: "What would it look like to lean into this even more? Where could you use it that you haven't yet?"
      }
    ],

    hints: {
      low:    "What are they already doing well? Name it before you name the problem. Build from strength, not from the gap.",
      mid:    "Good — you spotted something. Now name it clearly and ask them how it shows up elsewhere in their work.",
      high:   "Connect the strength to the challenge directly. 'Given that you're good at X — how could you use that here?'"
    },

    coachName: 'Morgan',
    coachPersona: 'energizing, positive leadership coach who helps people see and leverage what\'s already working'
  },

  // ─────────────────────────────────────────
  growth_mindset: {
    id: 'growth_mindset',
    label: 'Growth Mindset',
    shortLabel: 'Growth Mindset',
    available: true,
    icon: '🌀',
    tagline: 'From fixed to fluid — ability as a practice',
    description: 'Leaders who coach from a growth mindset help people reframe setbacks as information, effort as strategy, and ability as something developed — not given.',
    philosophy: 'Mindset (Carol Dweck) + Learning Agility research',
    estimatedTime: '~9 min to learn',

    stages: [
      { id: 'gm-1', label: '1. Fixed vs growth' },
      { id: 'gm-2', label: '2. How leaders trigger fixed' },
      { id: 'gm-3', label: '3. The reframe moves' },
      { id: 'gm-4', label: '4. Coaching in real time' }
    ],

    stageKeywords: {
      1: ['fixed', 'growth', 'talent', 'effort'],
      2: ['praise', 'smart', 'failure', 'trigger'],
      3: ['yet', 'process', 'strategy', 'reframe']
    },

    evalMoves: [
      {
        key: 'SPOT FIXED LANGUAGE',
        label: 'Spot Fixed Mindset Language',
        color: 'var(--teal)',
        defaultDef: 'Notice fixed mindset signals: "I\'m just not good at this", "I failed", "They\'re naturally talented." Name them neutrally.',
        defaultExample: "I noticed you said 'I'm just not a people person.' What makes you believe that's permanent?"
      },
      {
        key: 'ADD YET',
        label: 'Add "Yet"',
        color: 'var(--blue)',
        defaultDef: 'The simplest growth reframe: add "yet" to any fixed statement. It shifts the frame from verdict to trajectory.',
        defaultExample: "You haven't figured this out yet. That's not the same as not being able to."
      },
      {
        key: 'PRAISE PROCESS',
        label: 'Praise the Process',
        color: 'var(--purple)',
        defaultDef: 'Praise effort, strategy, and persistence — not intelligence or talent. Process praise builds growth.',
        defaultExample: "I want to recognize how you kept adjusting your approach when the first two things didn't work. That's the skill."
      },
      {
        key: 'REFRAME FAILURE',
        label: 'Reframe Failure as Data',
        color: 'var(--amber)',
        defaultDef: 'Treat setbacks as information, not verdict. Ask what they learned — not what went wrong.',
        defaultExample: "What did this experience teach you about how to approach it differently next time?"
      }
    ],

    hints: {
      low:    "Listen for fixed mindset language: 'I can't', 'I'm not', 'I never.' Gently ask if that's permanent or just current.",
      mid:    "Good. Praise the process, not the outcome. Ask: 'What did you try? What strategy did you use?'",
      high:   "Help them reframe the setback as data. Ask: 'What would you do differently — not better, differently?'"
    },

    coachName: 'Jordan',
    coachPersona: 'encouraging, growth-oriented leadership coach who helps people see ability as dynamic, not fixed'
  },

  // ─────────────────────────────────────────
  solution_focused_coaching: {
    id: 'solution_focused_coaching',
    label: 'Solution-Focused Coaching',
    shortLabel: 'Solution-Focused',
    available: true,
    icon: '🔭',
    tagline: 'What\'s already working? Do more of that.',
    description: 'A future-focused coaching approach that looks for exceptions, amplifies what\'s already working, and builds momentum toward solutions — without dwelling in the problem.',
    philosophy: 'Solution-Focused Brief Therapy (de Shazer) adapted for coaching',
    estimatedTime: '~9 min to learn',

    stages: [
      { id: 'sf-1', label: '1. Problem vs solution focus' },
      { id: 'sf-2', label: '2. The miracle question' },
      { id: 'sf-3', label: '3. Exceptions and scaling' },
      { id: 'sf-4', label: '4. First small step' }
    ],

    stageKeywords: {
      1: ['problem', 'solution', 'future', 'already'],
      2: ['miracle', 'imagine', 'different', 'tomorrow'],
      3: ['exception', 'scale', 'already working', '1 to 10']
    },

    evalMoves: [
      {
        key: 'PREFERRED FUTURE',
        label: 'Define the Preferred Future',
        color: 'var(--teal)',
        defaultDef: 'Help them describe what they want — not what they don\'t want. Future-pull, not problem-push.',
        defaultExample: "If this was already resolved — what would be different? What would you notice first?"
      },
      {
        key: 'EXCEPTIONS',
        label: 'Find Exceptions',
        color: 'var(--blue)',
        defaultDef: 'Identify when the problem doesn\'t happen. These exceptions contain the solution blueprint.',
        defaultExample: "Tell me about a time recently when it worked — even a little. What was different then?"
      },
      {
        key: 'SCALING',
        label: 'Scale Progress',
        color: 'var(--purple)',
        defaultDef: 'Use a 1–10 scale to create movement. Don\'t ask for perfection — ask what a half-step forward looks like.',
        defaultExample: "On a 1–10 scale where 10 is fully resolved — where are you now? What would make it a [n+1]?"
      },
      {
        key: 'SMALL STEP',
        label: 'Identify the Smallest Next Step',
        color: 'var(--amber)',
        defaultDef: 'Solutions don\'t need to be big. Find the smallest action that creates movement — and commit to it.',
        defaultExample: "What's one tiny thing you could do in the next 48 hours that would move the needle, even slightly?"
      }
    ],

    hints: {
      low:    "Don't analyze the problem — ask about the future. 'What would be different if this was already solved?'",
      mid:    "Good. Now find an exception. 'Tell me about a time when this wasn't a problem, even for a day.'",
      high:   "Great. Use the scale: 'Where are you on 1–10? What would make it one step higher?' Keep it small and specific."
    },

    coachName: 'Casey',
    coachPersona: 'optimistic, future-focused coaching guide who looks for what\'s already working and builds from there'
  }

};

// ─────────────────────────────────────────
// Active technique — default Active Listening
let currentTechnique = TECHNIQUES.active_listening;

function setTechnique(id) {
  if (TECHNIQUES[id] && TECHNIQUES[id].available) {
    currentTechnique = TECHNIQUES[id];
    return true;
  }
  return false;
}

function getAvailableTechniques() {
  return Object.values(TECHNIQUES);
}
