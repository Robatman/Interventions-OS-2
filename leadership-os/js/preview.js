// ═══════════════════════════════════════════
//  preview.js — Interventions OS v5.3
//  Juanjolote (Coach/green) + Ajolin (Agent/blue)
//  Real PNG assets from ../axolotls/
//  60 sec max — Bad → Good → Moves → Join
// ═══════════════════════════════════════════

// ─── IMAGE PATHS ──────────────────────────
const AX = {
  juan: {
    neutral:  'assets/juanjolote_neutral.png',
    happy:    'assets/juanjolote_happy.png',
    sad:      'assets/juanjolote_sad.png',
    angry:    'assets/juanjolote_angry.png',
    open:     'assets/juanjolote_open.png',
    talking:  'assets/juanjolote_talking.png',
    thinking: 'assets/juanjolote_neutral.png'
  },
  ajolin: {
    neutral:  'assets/ajolin_neutral.png',
    happy:    'assets/ajolin_happy.png',
    sad:      'assets/ajolin_sad.png',
    angry:    'assets/ajolin_sad.png',
    open:     'assets/ajolin_open.png',
    talking:  'assets/ajolin_talking.png',
    thinking: 'assets/ajolin_surprised.png',
    surprised:'assets/ajolin_surprised.png'
  }
};

function axImg(character, mood, size = 90) {
  const src = character === 'juanjolote'
    ? (AX.juan[mood]   || AX.juan.neutral)
    : (AX.ajolin[mood] || AX.ajolin.neutral);
  return `<img src="${src}" width="${size}" height="${size}" style="object-fit:contain;display:block;" alt="${character} ${mood}">`;
}

// ─── PREVIEW DATA ─────────────────────────

const TECHNIQUE_PREVIEWS = {

  // ── 1. Active Listening ────────────────
  active_listening: {
    title: 'Active Listening',
    tagline: "It's not about hearing — it's about making them feel heard.",
    roleA: 'Coach',
    bad: {
      label: "Without Active Listening",
      context: "Agent mentions they've been arriving late.",
      exchanges: [
        { speaker: 'A', mood: 'neutral', text: "Carlos, I noticed you've been late three times this week." },
        { speaker: 'B', mood: 'angry',   text: "I had to take my kid to the hospital. It's not like I wanted to be late." },
        { speaker: 'A', mood: 'neutral', text: "I understand, but tardiness affects the whole team's metrics." },
        { speaker: 'B', mood: 'sad',     text: "...Sure. Got it." }
      ],
      insight: "The coach heard the words but missed the person. Carlos shut down."
    },
    good: {
      label: "With Active Listening",
      context: "Same situation. Different stance.",
      exchanges: [
        { speaker: 'A', mood: 'neutral',  text: "Carlos, I noticed you've been late a few times. How are you doing?" },
        { speaker: 'B', mood: 'thinking', text: "Honestly... my kid's been sick. Hospital visits in the morning." },
        { speaker: 'A', mood: 'open',     text: "That sounds really hard. I can only imagine how stressful that's been." },
        { speaker: 'B', mood: 'open',     text: "Yeah... it's been a lot. I'm trying to figure it out." },
        { speaker: 'A', mood: 'talking',  text: "I hear you. Let's figure out something that works for your family and the team." }
      ],
      insight: "Same facts. Totally different outcome — because Carlos felt seen, not managed."
    },
    moves: [
      { icon: '👁', label: 'Pay Attention', desc: 'Be fully present — no phone, no planning your next line' },
      { icon: '🔄', label: 'Reflect Back',  desc: 'Repeat the core of what you heard in your own words' },
      { icon: '✅', label: 'Validate',      desc: "Acknowledge their feeling makes sense — even if you disagree" },
      { icon: '📋', label: 'Summarize',     desc: 'Recap before you respond — prevents misunderstanding' }
    ]
  },

  // ── 2. Powerful Questions ─────────────
  powerful_questions: {
    title: 'Powerful Questions',
    tagline: "The right question opens what the right answer never could.",
    roleA: 'Coach',
    bad: {
      label: "Weak Questions",
      context: "Stay Interview — checking in with an agent.",
      exchanges: [
        { speaker: 'A', mood: 'neutral', text: "Do you like working here?" },
        { speaker: 'B', mood: 'neutral', text: "Yeah, it's fine." },
        { speaker: 'A', mood: 'neutral', text: "Are you happy with your schedule?" },
        { speaker: 'B', mood: 'neutral', text: "Sure." },
        { speaker: 'A', mood: 'happy',   text: "Great! Thanks for the chat." }
      ],
      insight: "Closed questions get closed answers. Nothing was learned."
    },
    good: {
      label: "Powerful Questions",
      context: "Same conversation. Better questions.",
      exchanges: [
        { speaker: 'A', mood: 'neutral',  text: "What's kept you here over the past few months?" },
        { speaker: 'B', mood: 'thinking', text: "Honestly... the team. I really like the people I work with." },
        { speaker: 'A', mood: 'talking',  text: "What would need to change for this to feel even better for you?" },
        { speaker: 'B', mood: 'open',     text: "I think... I want to feel like there's somewhere to grow. You know?" }
      ],
      insight: "One open question opened what six closed questions never could."
    },
    moves: [
      { icon: '🚪', label: 'Open Questions',     desc: 'Start with What or How — never Why (sounds like blame)' },
      { icon: '🔍', label: 'Surface Assumptions', desc: 'Ask what they take for granted about the situation' },
      { icon: '🔮', label: 'Forward-Facing',      desc: 'Ask about possibility, not just what went wrong' },
      { icon: '🤫', label: 'Hold Silence',        desc: 'After a powerful question, resist filling the space' }
    ]
  },

  // ── 3. Motivational Interviewing ──────
  motivational_interviewing: {
    title: 'Motivational Interviewing',
    tagline: "Their reasons for change are more powerful than yours.",
    roleA: 'Coach',
    bad: {
      label: "Persuasion mode",
      context: "Agent keeps missing targets. Coach tries to convince them.",
      exchanges: [
        { speaker: 'A', mood: 'talking', text: "You really need to hit your numbers. It matters for your review." },
        { speaker: 'B', mood: 'neutral', text: "I know, I know." },
        { speaker: 'A', mood: 'neutral', text: "If you just focused more during calls, you'd get there." },
        { speaker: 'B', mood: 'angry',   text: "I am focused. I don't know what you want from me." }
      ],
      insight: "External pressure creates resistance, not motivation."
    },
    good: {
      label: "Motivational Interviewing",
      context: "Finding their own reasons.",
      exchanges: [
        { speaker: 'A', mood: 'neutral',  text: "What would hitting your targets mean for you personally?" },
        { speaker: 'B', mood: 'thinking', text: "Honestly? I want to move up. I want to show I can do more." },
        { speaker: 'A', mood: 'talking',  text: "So this matters to you. What's getting in the way?" },
        { speaker: 'B', mood: 'open',     text: "The afternoon calls are hard. I'm already tired by then." }
      ],
      insight: "They found their own reason to change. That's the only kind that sticks."
    },
    moves: [
      { icon: '🪞', label: 'Reflective Listening', desc: 'Reflect back what you hear — including the ambivalence' },
      { icon: '❓', label: 'Elicit Change Talk',    desc: 'Ask what change would mean for them, not for you' },
      { icon: '📊', label: 'Explore Importance',   desc: '"On a 1-10, how important is this to you? Why not lower?"' },
      { icon: '🚀', label: 'Build on Strengths',   desc: 'Reference what they have already done — not what they lack' }
    ]
  },

  // ── 4. Nonviolent Communication ───────
  nonviolent_communication: {
    title: 'Nonviolent Communication',
    tagline: "Feelings and needs — not accusations and demands.",
    roleA: 'Manager',
    bad: {
      label: "Jackal language",
      context: "Agent missed a deadline. Manager reacts.",
      exchanges: [
        { speaker: 'A', mood: 'angry',   text: "This is unacceptable. You never deliver on time." },
        { speaker: 'B', mood: 'angry',   text: "I always deliver! You just keep changing the goalposts." },
        { speaker: 'A', mood: 'angry',   text: "That's not true. You need to be more responsible." },
        { speaker: 'B', mood: 'sad',     text: "...Fine. Whatever." }
      ],
      insight: "Both are defending. Neither is connecting. The problem stays unsolved."
    },
    good: {
      label: "Giraffe language",
      context: "Same situation. NVC approach.",
      exchanges: [
        { speaker: 'A', mood: 'neutral',  text: "When I saw the report wasn't in by 5pm, I felt anxious..." },
        { speaker: 'B', mood: 'thinking', text: "I had a blocker — I should have said something earlier." },
        { speaker: 'A', mood: 'open',     text: "I need us to be able to trust our commitments. Would you be willing to flag blockers earlier next time?" },
        { speaker: 'B', mood: 'open',     text: "Yes. That's fair. I can do that." }
      ],
      insight: "Observation + feeling + need + request. No blame. Real resolution."
    },
    moves: [
      { icon: '👁', label: 'Observe, Don\'t Evaluate', desc: 'Say what happened — no judgment, no interpretation' },
      { icon: '💙', label: 'Name Your Feeling',         desc: 'An actual emotion — not a thought disguised as one' },
      { icon: '🌱', label: 'State Your Need',           desc: 'The underlying need — not the specific action you want' },
      { icon: '🙏', label: 'Make a Request',            desc: 'Specific, doable — and leave room for them to say no' }
    ]
  },

  // ── 5. Radical Candor ─────────────────
  radical_candor: {
    title: 'Radical Candor',
    tagline: "Care personally. Challenge directly. Both — at the same time.",
    roleA: 'Manager',
    bad: {
      label: "Ruinous Empathy",
      context: "Agent's performance is slipping. Manager avoids the conversation.",
      exchanges: [
        { speaker: 'A', mood: 'happy',   text: "Hey! Just wanted to say you're doing great. Keep it up!" },
        { speaker: 'B', mood: 'neutral', text: "...Thanks?" },
        { speaker: 'A', mood: 'neutral', text: "(3 weeks later) We need to talk about your numbers..." },
        { speaker: 'B', mood: 'angry',   text: "Why didn't you say something sooner?!" }
      ],
      insight: "Avoiding the hard conversation felt kind. It wasn't."
    },
    good: {
      label: "Radical Candor",
      context: "Same situation. Direct and caring.",
      exchanges: [
        { speaker: 'A', mood: 'talking',  text: "I want to talk about something because I think you can do better — and I think you know it too." },
        { speaker: 'B', mood: 'thinking', text: "...Yeah, I know my numbers have been off." },
        { speaker: 'A', mood: 'happy',    text: "I'm not bringing this up to pressure you. I see what you're capable of." },
        { speaker: 'B', mood: 'open',     text: "That actually means a lot. I've been struggling with something." }
      ],
      insight: "Honest AND caring. The challenge landed because the care was real."
    },
    moves: [
      { icon: '❤️', label: 'Care Personally',   desc: 'Know them as a human, not just a performance metric' },
      { icon: '🎯', label: 'Challenge Directly', desc: 'Say the thing that needs saying — clearly, not harshly' },
      { icon: '⚡', label: 'Be Specific',        desc: 'Point to a real moment, not a general pattern' },
      { icon: '🔁', label: 'Invite Response',    desc: 'Give them space to react — this is a conversation, not a verdict' }
    ]
  },

  // ── 6. Crucial Conversations ──────────
  crucial_conversations: {
    title: 'Crucial Conversations',
    tagline: "High stakes, strong emotions — stay in dialogue.",
    roleA: 'Manager',
    bad: {
      label: "Without the framework",
      context: "Manager needs to address a team conflict that's been building.",
      exchanges: [
        { speaker: 'A', mood: 'angry',   text: "I've heard there's been tension. This needs to stop — we're a team." },
        { speaker: 'B', mood: 'angry',   text: "Maybe if people actually communicated, there wouldn't be tension." },
        { speaker: 'A', mood: 'angry',   text: "I'm not here to take sides. Just fix it." },
        { speaker: 'B', mood: 'sad',     text: "...Great. Super helpful." }
      ],
      insight: "High stakes + no safety = people go silent or attack. Nothing gets resolved."
    },
    good: {
      label: "With Crucial Conversations",
      context: "Same situation. Starting with heart.",
      exchanges: [
        { speaker: 'A', mood: 'open',     text: "I want us to talk about something that matters — and I want us both to walk out trusting each other more." },
        { speaker: 'B', mood: 'thinking', text: "...Okay. I'm listening." },
        { speaker: 'A', mood: 'talking',  text: "Here's what I observed. Here's the story I've been telling myself — though I might be wrong. What's your read?" },
        { speaker: 'B', mood: 'open',     text: "I didn't realize how it was coming across. That changes things." }
      ],
      insight: "Safety first. Mutual purpose second. Then the truth can actually land."
    },
    moves: [
      { icon: '❤️', label: 'Start With Heart',    desc: 'Know what you really want before you open your mouth' },
      { icon: '🛡️', label: 'Restore Safety',      desc: 'When they go quiet or attack — step out of content, fix the container' },
      { icon: '🗺️', label: 'STATE Your Path',     desc: 'Share facts, tell your story tentatively, ask for theirs' },
      { icon: '🤝', label: 'Mutual Purpose',       desc: 'Find the goal you both share — that\'s the foundation' }
    ]
  },

  // ── 7. Tactical Empathy ───────────────
  tactical_empathy: {
    title: 'Tactical Empathy',
    tagline: "Name what they feel — and watch the walls come down.",
    roleA: 'Coach',
    bad: {
      label: "Logic mode",
      context: "Agent is resistant and disengaged. Coach tries reasoning.",
      exchanges: [
        { speaker: 'A', mood: 'neutral', text: "The data shows your engagement scores have dropped. We should make a plan." },
        { speaker: 'B', mood: 'angry',   text: "I'm fine. I just think these surveys are pointless." },
        { speaker: 'A', mood: 'neutral', text: "They're actually quite reliable. The methodology is solid." },
        { speaker: 'B', mood: 'sad',     text: "...Sure." }
      ],
      insight: "Logic doesn't move people who don't feel understood. It just makes them more defensive."
    },
    good: {
      label: "Tactical Empathy",
      context: "Same situation. Label first.",
      exchanges: [
        { speaker: 'A', mood: 'neutral',  text: "It seems like you're feeling like none of this actually changes anything." },
        { speaker: 'B', mood: 'surprised',text: "...Yeah. Kind of. I've seen people raise issues and nothing happens." },
        { speaker: 'A', mood: 'open',     text: "That sounds exhausting — putting in the effort when it feels invisible." },
        { speaker: 'B', mood: 'thinking', text: "It is. I used to care a lot more about this stuff." },
        { speaker: 'A', mood: 'talking',  text: "What would need to change for you to want to care again?" }
      ],
      insight: "Label the emotion first. They stopped defending. Now there's something real to work with."
    },
    moves: [
      { icon: '🏷️', label: 'Label the Emotion',      desc: '"It seems like..." — name what you see, then let them confirm' },
      { icon: '🪞', label: 'Mirror',                   desc: 'Repeat their last 2-3 words with a slight rise — let them keep going' },
      { icon: '🛡️', label: 'Accusation Audit',        desc: 'Name the negatives they might be thinking — before they do' },
      { icon: '❓', label: 'Calibrated Questions',     desc: '"What would need to change?" — not yes/no traps' }
    ]
  },

  // ── 8. SCARF Model ────────────────────
  scarf_model: {
    title: 'SCARF Model',
    tagline: "Five triggers. One calm brain. Better conversations.",
    roleA: 'Manager',
    bad: {
      label: "SCARF threat mode",
      context: "Manager announces a process change without context.",
      exchanges: [
        { speaker: 'A', mood: 'neutral', text: "Starting Monday we're changing how you log calls. New system, new rules." },
        { speaker: 'B', mood: 'angry',   text: "Why? What's wrong with what we're doing?" },
        { speaker: 'A', mood: 'neutral', text: "It came from above. Just adapt." },
        { speaker: 'B', mood: 'sad',     text: "Nobody ever asks us anything..." }
      ],
      insight: "Status, Certainty, Autonomy — all threatened at once. The brain goes into defense mode."
    },
    good: {
      label: "SCARF-aware approach",
      context: "Same change. Delivered differently.",
      exchanges: [
        { speaker: 'A', mood: 'open',     text: "I want to walk you through a change coming Monday — and explain the why." },
        { speaker: 'B', mood: 'neutral',  text: "Okay..." },
        { speaker: 'A', mood: 'talking',  text: "Your input actually shaped this. The team flagged the logging issue last quarter." },
        { speaker: 'B', mood: 'thinking', text: "Oh — I didn't know that." },
        { speaker: 'A', mood: 'happy',    text: "How you implement it is up to you. What would make the transition easier?" }
      ],
      insight: "Status protected. Certainty given. Autonomy preserved. Brain stays open."
    },
    moves: [
      { icon: '👑', label: 'Protect Status',    desc: 'Acknowledge their contribution before naming the problem' },
      { icon: '🔦', label: 'Give Certainty',    desc: 'Ambiguity triggers threat — give as much clarity as you can' },
      { icon: '🎮', label: 'Grant Autonomy',    desc: 'Give choices, not orders — even when the outcome is the same' },
      { icon: '🤝', label: 'Signal Belonging',  desc: 'Make it clear you\'re on the same side — not auditing them' }
    ]
  },

  // ── 9. Immunity to Change ─────────────
  immunity_to_change: {
    title: 'Immunity to Change',
    tagline: "They're not resistant. They're immune. There's a difference.",
    roleA: 'Coach',
    bad: {
      label: "Willpower coaching",
      context: "Agent keeps saying they'll speak up more — and doesn't.",
      exchanges: [
        { speaker: 'A', mood: 'neutral', text: "You said last month you'd start voicing your ideas in team meetings." },
        { speaker: 'B', mood: 'sad',     text: "I know. I just... keep forgetting." },
        { speaker: 'A', mood: 'neutral', text: "Maybe set a reminder? Or write a note beforehand?" },
        { speaker: 'B', mood: 'sad',     text: "Yeah... sure. I'll try." }
      ],
      insight: "If they could just 'try harder,' they would have. The block is deeper than tactics."
    },
    good: {
      label: "Immunity to Change",
      context: "Looking for what's underneath.",
      exchanges: [
        { speaker: 'A', mood: 'neutral',  text: "What do you worry would happen if you actually did speak up?" },
        { speaker: 'B', mood: 'thinking', text: "Honestly? That people would think I'm showing off. Or wrong." },
        { speaker: 'A', mood: 'open',     text: "So part of you is committed to not looking bad in front of the group." },
        { speaker: 'B', mood: 'surprised',text: "...I never thought of it that way. But yes." },
        { speaker: 'A', mood: 'talking',  text: "That's not a weakness — it's a protection. What would it take to test that assumption, just once?" }
      ],
      insight: "The hidden commitment revealed itself. Now change is possible."
    },
    moves: [
      { icon: '🎯', label: 'Name the Goal',             desc: 'What do they keep saying they\'ll do — but don\'t?' },
      { icon: '🔍', label: 'Find What They Do Instead', desc: 'Competing behaviors are clues, not failures' },
      { icon: '🔒', label: 'Uncover Hidden Commitment', desc: 'What\'s the real thing they\'re protecting?' },
      { icon: '🧪', label: 'Test the Big Assumption',   desc: 'Run a small experiment — don\'t just believe the story' }
    ]
  },

  // ── 10. Drama Triangle ────────────────
  drama_triangle: {
    title: 'Drama Triangle',
    tagline: "Victim. Rescuer. Persecutor. Don't play any of them.",
    roleA: 'Manager',
    bad: {
      label: "Hooked into the triangle",
      context: "Agent complains about a colleague. Manager rescues.",
      exchanges: [
        { speaker: 'B', mood: 'sad',     text: "Sandra never helps me when I'm slammed. It's so unfair." },
        { speaker: 'A', mood: 'happy',   text: "I'll talk to Sandra. Don't worry — I'll sort it out." },
        { speaker: 'B', mood: 'neutral', text: "(next week) It happened again. Can you talk to her again?" },
        { speaker: 'A', mood: 'sad',     text: "...Sure." }
      ],
      insight: "The Rescuer saved the Victim. The cycle continues — and the manager owns the problem now."
    },
    good: {
      label: "Exiting the triangle",
      context: "Same complaint. Different response.",
      exchanges: [
        { speaker: 'B', mood: 'sad',      text: "Sandra never helps me when I'm slammed. It's so unfair." },
        { speaker: 'A', mood: 'neutral',  text: "That sounds frustrating. What are you looking for from me — advice, or just to vent?" },
        { speaker: 'B', mood: 'thinking', text: "I... don't know. I guess I want it to change." },
        { speaker: 'A', mood: 'talking',  text: "What's one thing you could do directly to address it with Sandra?" }
      ],
      insight: "No rescue. No verdict. The manager handed agency back. That's the real help."
    },
    moves: [
      { icon: '🎭', label: 'Spot the Role',        desc: 'Notice which role you\'re being pulled into — before you play it' },
      { icon: '⏸️', label: 'Pause the Pattern',    desc: '"What are you looking for from me?" — breaks the script' },
      { icon: '🌟', label: 'Move to Creator',      desc: 'Shift from "what\'s wrong" to "what do you want"' },
      { icon: '💪', label: 'Challenge Forward',    desc: 'Hold them to their stated want — believe in their capability' }
    ]
  },

  // ── 11. GROW Model ────────────────────
  grow_model: {
    title: 'GROW Model',
    tagline: "Goal. Reality. Options. Will. In that order.",
    roleA: 'Coach',
    bad: {
      label: "Jumping to solutions",
      context: "Agent is stuck on a performance challenge. Coach goes straight to advice.",
      exchanges: [
        { speaker: 'B', mood: 'sad',     text: "I just can't seem to close calls. I don't know what I'm doing wrong." },
        { speaker: 'A', mood: 'talking', text: "Try mirroring the customer's tone more. And slow down your pitch." },
        { speaker: 'B', mood: 'neutral', text: "Okay... I'll try that." },
        { speaker: 'A', mood: 'happy',   text: "Great. Let me know how it goes." }
      ],
      insight: "Advice without context. The agent didn't own the solution — so it probably won't stick."
    },
    good: {
      label: "GROW in action",
      context: "Same challenge. Four stages.",
      exchanges: [
        { speaker: 'A', mood: 'neutral',  text: "What would you like to walk away from this conversation having figured out?" },
        { speaker: 'B', mood: 'thinking', text: "I want to understand why my close rate is so much lower than the team's." },
        { speaker: 'A', mood: 'talking',  text: "What have you already tried? And what do you think is actually going on?" },
        { speaker: 'B', mood: 'open',     text: "I rush. I get nervous near the end and speed up instead of slowing down." },
        { speaker: 'A', mood: 'happy',    text: "What's one thing you could test in your next five calls?" }
      ],
      insight: "They diagnosed themselves. They own the solution. That's what makes GROW work."
    },
    moves: [
      { icon: '🎯', label: 'Goal',    desc: 'What do they want from this conversation — specifically?' },
      { icon: '🗺️', label: 'Reality', desc: 'What\'s actually happening? What have they tried?' },
      { icon: '💡', label: 'Options', desc: 'What could they do? Generate — don\'t prescribe' },
      { icon: '🤝', label: 'Will',    desc: 'What will they actually do? By when? Commitment level?' }
    ]
  },

  // ── 12. Strengths-Based Coaching ─────
  strengths_based_coaching: {
    title: 'Strengths-Based Coaching',
    tagline: "Build from what's working — not what's broken.",
    roleA: 'Coach',
    bad: {
      label: "Deficit-focused coaching",
      context: "Agent struggling with difficult customers. Coach leads with gaps.",
      exchanges: [
        { speaker: 'A', mood: 'neutral', text: "Your empathy scores are low. You need to connect more with customers." },
        { speaker: 'B', mood: 'sad',     text: "I know. I'm just not naturally warm like some people are." },
        { speaker: 'A', mood: 'neutral', text: "You'll need to practice more. I'll send you some training modules." },
        { speaker: 'B', mood: 'sad',     text: "...Okay." }
      ],
      insight: "Fixing weaknesses is slow, demoralizing, and rarely changes the result."
    },
    good: {
      label: "Strengths-based approach",
      context: "Same challenge. Different starting point.",
      exchanges: [
        { speaker: 'A', mood: 'open',     text: "When do your calls go best? What's happening in those moments?" },
        { speaker: 'B', mood: 'thinking', text: "When I really understand the problem. I'm good at digging in and solving things." },
        { speaker: 'A', mood: 'happy',    text: "That problem-solving instinct is actually a real gift. How could you use that more on difficult calls?" },
        { speaker: 'B', mood: 'open',     text: "Maybe ask more about what they've already tried? Show them I'm actually investigating?" }
      ],
      insight: "They found their own strategy — using a strength they already had. That's the lever."
    },
    moves: [
      { icon: '🔦', label: 'Spot the Strength',      desc: 'What do they do naturally — especially what they take for granted?' },
      { icon: '🪞', label: 'Name It Back',            desc: 'People don\'t see their own gifts — help them see it clearly' },
      { icon: '🔗', label: 'Link to the Challenge',  desc: 'Connect their strength directly to the problem they\'re facing' },
      { icon: '📈', label: 'Develop the Strength',   desc: 'Don\'t just recognize it — help them invest in it intentionally' }
    ]
  },

  // ── 13. Growth Mindset ────────────────
  growth_mindset: {
    title: 'Growth Mindset',
    tagline: "Ability is not fixed. It's built — one attempt at a time.",
    roleA: 'Coach',
    bad: {
      label: "Fixed mindset reinforced",
      context: "Agent failed to hit target. Coach responds with outcome praise.",
      exchanges: [
        { speaker: 'B', mood: 'sad',     text: "I tried everything. I'm just not a closer. Some people have it, I don't." },
        { speaker: 'A', mood: 'neutral', text: "Well, you're great at customer relationships. Maybe closing isn't your thing." },
        { speaker: 'B', mood: 'sad',     text: "Yeah... probably." },
        { speaker: 'A', mood: 'neutral', text: "Keep doing what you're good at." }
      ],
      insight: "The coach confirmed the fixed belief. The label just got more permanent."
    },
    good: {
      label: "Growth Mindset coaching",
      context: "Same situation. Reframing the story.",
      exchanges: [
        { speaker: 'B', mood: 'sad',      text: "I tried everything. I'm just not a closer." },
        { speaker: 'A', mood: 'neutral',  text: "You haven't mastered it yet. What's different about the calls where you do close?" },
        { speaker: 'B', mood: 'thinking', text: "Hm. When I've done more upfront questions, actually." },
        { speaker: 'A', mood: 'happy',    text: "So you have a strategy that works. What would it look like to use it more deliberately?" },
        { speaker: 'B', mood: 'open',     text: "I could try it as a rule — always two discovery questions before pitching." }
      ],
      insight: "From verdict to trajectory. Same person — different frame."
    },
    moves: [
      { icon: '👂', label: 'Catch Fixed Language',  desc: '"I\'m not good at this" — is that permanent or just current?' },
      { icon: '⏳', label: 'Add "Yet"',              desc: 'The simplest reframe. Not "can\'t" — "can\'t yet"' },
      { icon: '⚙️', label: 'Praise the Process',    desc: 'Recognize effort and strategy — not talent or outcome' },
      { icon: '📊', label: 'Reframe Failure',       desc: 'Setbacks are data. Ask what they learned — not what went wrong' }
    ]
  },

  // ── 14. Solution-Focused Coaching ─────
  solution_focused_coaching: {
    title: 'Solution-Focused Coaching',
    tagline: "What's already working? Start there.",
    roleA: 'Coach',
    bad: {
      label: "Problem-focused loop",
      context: "Agent brings a recurring issue. Coach digs into the problem.",
      exchanges: [
        { speaker: 'B', mood: 'sad',     text: "The afternoon calls are brutal. I just can't stay focused." },
        { speaker: 'A', mood: 'neutral', text: "How long has this been going on?" },
        { speaker: 'B', mood: 'sad',     text: "Months, I think. Maybe since the schedule change." },
        { speaker: 'A', mood: 'neutral', text: "What do you think is causing it?" },
        { speaker: 'B', mood: 'sad',     text: "I really don't know. That's the problem." }
      ],
      insight: "Analyzing the problem didn't create movement. It just made them more stuck."
    },
    good: {
      label: "Solution-Focused",
      context: "Looking for exceptions and small steps.",
      exchanges: [
        { speaker: 'A', mood: 'neutral',  text: "Tell me about a recent afternoon call that actually went well — even a little." },
        { speaker: 'B', mood: 'thinking', text: "Actually yesterday. I had a coffee, did a quick review — it was fine." },
        { speaker: 'A', mood: 'happy',    text: "What was different about that? What did you do?" },
        { speaker: 'B', mood: 'open',     text: "I had energy. And I actually knew the account before calling." },
        { speaker: 'A', mood: 'talking',  text: "So the blueprint is already there. What's one small thing you could replicate tomorrow?" }
      ],
      insight: "The solution was hidden in the exception. They already knew how — they just didn't see it."
    },
    moves: [
      { icon: '🔭', label: 'Define the Future',   desc: '"If this was resolved, what would be different?" — pull toward the goal' },
      { icon: '🔍', label: 'Find Exceptions',     desc: '"When does the problem NOT happen?" — that\'s the blueprint' },
      { icon: '📏', label: 'Scale Progress',      desc: '"Where are you 1-10? What would move it one step higher?"' },
      { icon: '👣', label: 'Smallest Next Step',  desc: 'Tiny, specific, doable — momentum beats perfection' }
    ]
  }

};

// ─── PREVIEW STATE ────────────────────────

let previewStep  = 0;
let previewExIdx = 0;
let previewData  = null;

// ─── ENTRY POINT ──────────────────────────

function showTechniquePreview(techniqueId) {
  previewData = TECHNIQUE_PREVIEWS[techniqueId];
  if (!previewData) { show('s-mode'); return; }
  previewStep  = 0;
  previewExIdx = 0;
  renderPreviewStep();
  show('s-preview');
}

// ─── STEP RENDERER ────────────────────────

function renderPreviewStep() {
  const el = document.getElementById('preview-stage');
  if (!el || !previewData) return;

  if      (previewStep === 0) renderConvo(el, previewData.bad,  false);
  else if (previewStep === 1) renderConvo(el, previewData.good, true);
  else if (previewStep === 2) renderMoves(el);
  else if (previewStep === 3) renderJoin(el);

  for (let i = 0; i < 4; i++) {
    const dot = document.getElementById(`pdot-${i}`);
    if (dot) {
      dot.classList.toggle('active', i === previewStep);
      dot.classList.toggle('done',   i < previewStep);
    }
  }
}

function renderConvo(el, data, isGood) {
  const color = isGood ? 'var(--teal)' : 'var(--coral)';
  const icon  = isGood ? '✅' : '❌';

  el.innerHTML = `
    <div class="preview-label" style="color:${color};">${icon} ${data.label}</div>
    <div class="preview-context">${data.context}</div>
    <div class="preview-scene">
      <div class="preview-chars">
        <div class="preview-char" id="prev-juan">
          ${axImg('juanjolote','neutral',88)}
          <div class="char-name">Juanjolote</div>
          <div class="char-role">${previewData.roleA}</div>
        </div>
        <div class="preview-char" id="prev-ajolin">
          ${axImg('ajolin','neutral',88)}
          <div class="char-name">Ajolin</div>
          <div class="char-role">Agent</div>
        </div>
      </div>
      <div class="preview-bubble-wrap" id="preview-bubble">
        <div class="preview-bubble-inner">
          <span class="bubble-speaker" id="bubble-speaker"></span>
          <span class="bubble-text"    id="bubble-text"></span>
        </div>
      </div>
    </div>
    <div class="preview-insight" id="preview-insight" style="display:none;">
      <span style="color:${color};margin-right:6px;">💡</span>${data.insight}
    </div>
    <div class="preview-nav">
      <button class="preview-next-btn" id="preview-next-btn" onclick="nextExchange()">
        Next ▶
      </button>
    </div>`;

  previewExIdx = 0;
  showExchange(data.exchanges);
}

function showExchange(exchanges) {
  if (previewExIdx >= exchanges.length) {
    const insight = document.getElementById('preview-insight');
    if (insight) insight.style.display = 'flex';
    const btn = document.getElementById('preview-next-btn');
    if (btn) btn.textContent = previewStep === 0 ? 'See it done right →' : 'See the moves →';
    return;
  }

  const ex     = exchanges[previewExIdx];
  const isJuan = ex.speaker === 'A';

  const bubbleEl  = document.getElementById('preview-bubble');
  const speakerEl = document.getElementById('bubble-speaker');
  const textEl    = document.getElementById('bubble-text');
  const juanEl    = document.getElementById('prev-juan');
  const ajolinEl  = document.getElementById('prev-ajolin');

  if (bubbleEl)  bubbleEl.className = `preview-bubble-wrap ${isJuan ? 'from-juan' : 'from-ajolin'}`;
  if (speakerEl) speakerEl.textContent = (isJuan ? 'Juanjolote' : 'Ajolin') + ': ';
  if (textEl)    textEl.textContent = ex.text;

  if (juanEl)   juanEl.innerHTML   = axImg('juanjolote', isJuan ? ex.mood : 'neutral', 88) + `<div class="char-name">Juanjolote</div><div class="char-role">${previewData.roleA}</div>`;
  if (ajolinEl) ajolinEl.innerHTML = axImg('ajolin', !isJuan ? ex.mood : 'neutral', 88) + `<div class="char-name">Ajolin</div><div class="char-role">Agent</div>`;

  if (juanEl)   juanEl.style.opacity   = isJuan  ? '1' : '0.5';
  if (ajolinEl) ajolinEl.style.opacity = !isJuan ? '1' : '0.5';
}

function nextExchange() {
  if (!previewData) return;

  // On moves or join step — go to next step directly
  if (previewStep >= 2) {
    previewStep++;
    if (previewStep > 3) previewStep = 3;
    renderPreviewStep();
    return;
  }

  const exchanges = previewStep === 0 ? previewData.bad.exchanges : previewData.good.exchanges;

  // Still have exchanges to show
  if (previewExIdx < exchanges.length) {
    previewExIdx++;
    showExchange(exchanges);
    return;
  }

  // Exchanges done — move to next step
  previewStep++;
  previewExIdx = 0;
  renderPreviewStep();
}

function renderMoves(el) {
  const moves = previewData.moves;
  el.innerHTML = `
    <div class="preview-label" style="color:var(--blue);">🎯 The ${moves.length} moves</div>
    <div class="preview-moves-grid">
      ${moves.map((m, i) => `
        <div class="preview-move-card" style="animation-delay:${i * 0.12}s">
          <div class="move-icon">${m.icon}</div>
          <div class="move-label">${m.label}</div>
          <div class="move-desc">${m.desc}</div>
        </div>`).join('')}
    </div>
    <div class="preview-nav">
      <button class="preview-next-btn" onclick="nextExchange()">
        I'm ready — let's go →
      </button>
    </div>`;
}

function renderJoin(el) {
  const t = currentTechnique;
  el.innerHTML = `
    <div style="text-align:center;margin-bottom:16px;">
      <div style="font-size:36px;margin-bottom:6px;">${t.icon}</div>
      <div style="font-size:17px;font-weight:700;color:var(--text);margin-bottom:4px;">${t.label}</div>
      <div style="font-size:13px;color:var(--text2);">${t.tagline}</div>
    </div>
    <div style="display:flex;justify-content:center;gap:16px;margin-bottom:16px;">
      <div style="text-align:center;">
        ${axImg('juanjolote','happy',72)}
        <div style="font-size:11px;color:var(--teal);margin-top:4px;font-weight:600;">Juanjolote</div>
      </div>
      <div style="text-align:center;">
        ${axImg('ajolin','happy',72)}
        <div style="font-size:11px;color:var(--coral);margin-top:4px;font-weight:600;">Ajolin</div>
      </div>
    </div>
    <div class="choice-grid">
      <button class="choice-btn" onclick="goLearn()">
        <span class="choice-icon">📖</span>
        <div class="choice-body">
          <div class="choice-label">Learn</div>
          <div class="choice-sub">Alex teaches you the full technique</div>
        </div>
      </button>
      <button class="choice-btn" onclick="goWork()">
        <span class="choice-icon">🤝</span>
        <div class="choice-body">
          <div class="choice-label">Work Together</div>
          <div class="choice-sub">Bring a real situation</div>
        </div>
      </button>
      <button class="choice-btn" onclick="goPractice()">
        <span class="choice-icon">🎯</span>
        <div class="choice-body">
          <div class="choice-label">Practice</div>
          <div class="choice-sub">Simulate a real conversation</div>
        </div>
      </button>
    </div>`;
}

// ─── SESSION HISTORY ──────────────────────

function showHistory() {
  show('s-history');
  renderHistory();
}

function renderHistory() {
  const el = document.getElementById('history-content');
  if (!el) return;

  const sessions = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('ldr_session_')) {
      try {
        const s = JSON.parse(localStorage.getItem(key));
        if (s) sessions.push(s);
      } catch(e) {}
    }
  }

  sessions.sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

  if (sessions.length === 0) {
    el.innerHTML = `
      <div class="insight-card ic-teal" style="text-align:center;padding:24px;">
        <div style="font-size:32px;margin-bottom:8px;">🌱</div>
        <div class="ic-label">No sessions yet</div>
        <div>Complete your first practice session to start tracking your progress.</div>
      </div>`;
    return;
  }

  const totalSessions = sessions.length;
  const avgMood    = Math.round(sessions.reduce((s, x) => s + (x.moodFinal || 0), 0) / totalSessions);
  const outOfBox   = sessions.filter(s => s.boxFinal === 'out').length;
  const techniques    = [...new Set(sessions.map(s => s.technique).filter(Boolean))];
  const interventions = [...new Set(sessions.map(s => s.intervention).filter(Boolean))];

  el.innerHTML = `
    <div class="history-stats">
      <div class="stat-card"><div class="stat-num">${totalSessions}</div><div class="stat-lbl">Sessions</div></div>
      <div class="stat-card"><div class="stat-num">${avgMood}%</div><div class="stat-lbl">Avg Openness</div></div>
      <div class="stat-card"><div class="stat-num">${outOfBox}</div><div class="stat-lbl">Out of Box</div></div>
      <div class="stat-card"><div class="stat-num">${techniques.length + interventions.length}</div><div class="stat-lbl">Topics</div></div>
    </div>
    <div style="margin:16px 0 8px;"><span class="label-sm">Recent sessions</span></div>
    ${sessions.slice(0, 10).map(s => {
      const date    = s.completedAt ? new Date(s.completedAt).toLocaleDateString('en-US', { month:'short', day:'numeric' }) : '—';
      const context = s.intervention
        ? (INTERVENTIONS[s.intervention]?.label || s.intervention)
        : (TECHNIQUES[s.technique]?.label || s.technique || '—');
      const levelColors = { novice:'var(--teal)', mid:'var(--amber)', adv:'var(--coral)' };
      const levelColor  = levelColors[s.level] || 'var(--text3)';
      const moodColor   = (s.moodFinal||0) < 35 ? 'var(--coral)' : (s.moodFinal||0) < 60 ? 'var(--amber)' : 'var(--teal)';
      const agentName   = s.archetype ? (ARCHETYPES[s.archetype]?.name?.split(' ')[0] || s.archetype) : '—';
      return `
        <div class="history-row">
          <div class="history-date">${date}</div>
          <div class="history-main">
            <div class="history-context">${context}</div>
            <div class="history-meta">
              <span style="color:${levelColor};font-size:10px;font-weight:600;text-transform:uppercase;">${s.level||'—'}</span>
              <span style="color:var(--text3);font-size:10px;margin:0 4px;">·</span>
              <span style="font-size:10px;color:var(--text3);">${agentName}</span>
            </div>
            ${s.evalSummary ? `<div class="history-insight">"${s.evalSummary.substring(0,80)}${s.evalSummary.length>80?'...':''}"</div>` : ''}
          </div>
          <div class="history-mood" style="color:${moodColor};">${s.moodFinal||0}%</div>
        </div>`;
    }).join('')}
    ${sessions.length > 10 ? `<div style="text-align:center;font-size:11px;color:var(--text3);margin-top:8px;">+ ${sessions.length - 10} more sessions</div>` : ''}`;
}
