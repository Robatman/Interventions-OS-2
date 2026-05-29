// ═══════════════════════════════════════════
//  techniques.js
//  Leadership technique data — Leadership OS v4
//  Each technique drives its own Learn mode content,
//  eval criteria, and coach persona.
// ═══════════════════════════════════════════

const TECHNIQUES = {

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

    // Learn mode stages shown in progress bar
    stages: [
      { id: 'ls-1', label: '1. The why' },
      { id: 'ls-2', label: '2. What it is' },
      { id: 'ls-3', label: '3. How to do it' },
      { id: 'ls-4', label: '4. Check understanding' }
    ],

    // Keyword detection for learn progress tracking
    stageKeywords: {
      1: ['box', 'self-deception', 'why'],
      2: ['reflect', 'validate', '80', 'four'],
      3: ['try this', 'practice', 'next time']
    },

    // Eval move definitions — used in technique recap
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

    // Hint text pool — used in practice mode
    hints: {
      low:    "Try reflecting back what they just said before asking anything. Literally: \"So what I'm hearing is...\"",
      mid:    "You're making progress. Ask an open question about them as a person, not about the work.",
      high:   "They're opening up. Keep listening — don't pivot to solutions yet."
    },

    // Coach name and persona modifier
    coachName: 'Alex',
    coachPersona: 'warm, intelligent leadership coach'
  },

  // ─────────────────────────────────────────
  powerful_questions: {
    id: 'powerful_questions',
    label: 'Powerful Questions',
    shortLabel: 'Powerful Questions',
    available: false, // Unlocks in v4.1
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
  }
};

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
