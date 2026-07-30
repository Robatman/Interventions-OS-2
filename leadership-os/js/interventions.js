// ═══════════════════════════════════════════
//  interventions.js
//  Intervention definitions — Interventions OS v5
//  The 4 retention conversations, each with:
//  - Journey timing and owner
//  - Objective and success criteria  
//  - Agent behavior context (what the agent knows/feels at this point)
//  - Briefing scenarios per level
//  - Relevant techniques
// ═══════════════════════════════════════════

const INTERVENTIONS = {

  // ─────────────────────────────────────────
  pulse_check: {
    id: 'pulse_check',
    label: 'Pulse Check',
    day: 30,
    dayLabel: 'Día 30',
    icon: '💓',
    color: 'teal',
    owner: ['Recruiting', 'Training', 'Coach'],
    ownerLabel: 'Paulina (Recruiting) · Kat (Training) · Coach asignado',

    objective: `First review of the newly joined agent. Detect early signs of risk of leaving before they become a problem. The agent does NOT know that this is a formal intervention — for them it is just a follow-up conversation.`,
    successCriteria: [
    'The agent feels listened to, not evaluated',
    'You identified at least one area of opportunity or real concern',
    'The agent leaves with more confidence in the company, not less',
    'If everything is fine, you genuinely confirmed it — you did not assume'
  ],

    // What the agent knows/feels at this point in the journey
    agentContext: `It is day 30. The agent has been with the company for one month. They are still learning, they are still adapting. They may be excited, overwhelmed, confused, or simply trying to survive the learning curve. They do not know that this conversation has a retention objective. To them, someone from the company came to say hello.`,
    // The trap — what practitioners often do wrong
    trap: `Assume that "fine" means fine. The new agent often says they are fine because they do not want to seem weak or problematic. The real Pulse Check is the conversation after "I'm fine".`,
    relevantTechniques: ['active_listening', 'powerful_questions'],

    // Scenarios per level — what the practitioner is briefed on
    scenarios: {
      novice: [
        {
          id: 'pc_nov_1',
          text: "It is Karen's day 30 at the call center. Her training metrics are normal. There are no recorded incidents. You are going to do her Pulse Check — a follow-up conversation to see how she is doing.",          tags: ["Sin incidentes", "Métricas normales", "Primera conversación formal"],
          agentState: "adapting-okay",
          agentHiddenState: "tired-but-hopeful",
          startMood: 55,
          agentName: 'karen'
        },
        {
          id: 'pc_nov_2',
          text: "Carlos has been here for 30 days. In his first week he had difficulties with the system, but he improved. This week he has been quiet. You are going to do his Pulse Check.",
          tags: ["Initial difficulty overcome", "Quiet this week", "No formal report"],
          agentState: "guarded-tired",
          agentHiddenState: "doubting-fit",
          startMood: 35,
          agentName: 'carlos'
        }
      ],
      mid: [
        {
          id: 'pc_mid_1',
          text: "Miguel has been here for 30 days. He has been saying that everything is fine in every group check-in. A coworker told you they saw him frustrated during the break. You are going to do his Pulse Check.",
          tags: ["Says everything is fine", "Signal from a coworker", "No direct evidence"],
          agentState: "performing-okay",
          agentHiddenState: "overwhelmed-hiding-it",
          startMood: 45,
          randomTriggers: true,
          agentName: 'miguel'
        }
      ],
      adv: [
        {
          id: 'pc_adv_1',
          text: "It is day 30 for a new agent. You do not have any specific information — only that it is their scheduled Pulse Check. The briefing you received from Recruiting says 'nothing new'.",
          tags: ["No prior information", "Empty briefing", "Anything can happen"],
          agentState: "unknown",
          agentHiddenState: "unknown",
          startMood: null,
          misleading: true,
          agentName: 'carlos'
        }
      ]
    }
  },

  // ─────────────────────────────────────────
  anchoring: {
    id: 'anchoring',
    label: 'Anchoring',
    day: 100,
    dayLabel: 'Día 100',
    icon: '⚓',
    color: 'purple',
    owner: ['Manager'],
    ownerLabel: 'Manager directo',

    objective: `Anchor the agent to the company now that they have passed the initial stage but are still not fully established. It is a conversation about belonging, goals, and commitment. The agent has already survived the first 90 days — now you have to make sure they want to stay.`,

    successCriteria: [
    'The agent connected their work with something that matters to them personally',
    'You identified what motivates them beyond the salary',
    'The agent feels they have a future in the company, not just a job',
    'They left the conversation with more clarity about their career path'
  ],

    agentContext: `It is day 100. The agent already knows the job, already has their routines, and has already formed opinions about the company, the team, and the manager. They may be establishing themselves positively, or they may be entering the "this is just a job" zone. They do not know that this conversation has an anchoring objective — to them, the manager wanted to talk.`,

    trap: `Turn the Anchoring into a metrics review. The agent already knows how they are doing in terms of numbers — what they need is to feel that someone cares about them as a person, not as an agent.`,

    relevantTechniques: ['active_listening', 'powerful_questions'],

    scenarios: {
      novice: [
        {
          id: 'anch_nov_1',
          text: "Carlos has been here for 100 days. His metrics are stable. He has integrated well with the team. There are no warning signs. It is time for his Anchoring.",
          tags: ["Stable", "Integrated with the team", "No warning signs"],
          agentState: "settled-neutral",
          agentHiddenState: "questioning-future",
          startMood: 50,
          agentName: 'carlos'
        }
      ],
      mid: [
        {
          id: 'anch_mid_1',
          text: "Valeria has been here for 100 days. She started very well, but in the last few weeks her energy has gone down a little. She is still meeting her metrics. It is time for her Anchoring.",
          tags: ["Strong start", "Energy going down", "Metrics OK"],
          agentState: "slightly-withdrawn",
          agentHiddenState: "reconsidering-commitment",
          startMood: 38,
          randomTriggers: true,
          agentName: 'valeria'
        }
      ],
      adv: [
        {
          id: 'anch_adv_1',
          text: "Sandra has been here for 100 days. She arrived with a lot of experience from another company. She has been critical of some internal processes. Her metrics are excellent. It is time for her Anchoring.",
          tags: ["High experience", "Criticism of processes", "Excellent performance"],
          agentState: "confident-comparing",
          agentHiddenState: "evaluating-whether-to-stay",
          startMood: 40,
          misleading: true,
          agentName: 'sandra'
        }
      ]
    }
  },

  // ─────────────────────────────────────────
  stay_interview: {
    id: 'stay_interview',
    label: 'Stay Interview',
    day: 121,
    dayLabel: 'Día 121',
    icon: '🎯',
    color: 'amber',
    owner: ['HR'],
    ownerLabel: 'Andrea (HR)',

    objective: `Ask the agent directly why they stay, what they like, what they would change. It is the most powerful tool for proactive retention because it is done BEFORE they think about leaving. It is not an exit interview — it is the conversation that prevents you from reaching the exit interview.`,

    successCriteria: [
    'The agent said at least one genuine thing they appreciate about the company',
    'The agent mentioned at least one thing they would change — and you listened without defending yourself',
    'You left with actionable information to improve their experience',
    'The agent felt that this conversation was real, not an HR procedure'
  ],

    agentContext: `It is day 121. The agent has already been here for 4 months. They already have formed opinions. They already know what they like and what they do not. They may be satisfied, they may be starting to have doubts, or they may be actively considering options. They do not know that this is a Stay Interview — to them, HR wanted to talk.`,

    trap: `Make the Stay Interview into a survey. Ask "what do you like?" and write down the answer without going deeper. The real Stay Interview requires listening to what is behind the answer, not just the answer itself.`,

    relevantTechniques: ['active_listening', 'powerful_questions'],

    scenarios: {
      novice: [
        {
          id: 'stay_nov_1',
          text: "Carlos has been here for 121 days. He has had ups and downs but overall he is doing well. It is time for his Stay Interview. Your goal is to genuinely understand what keeps him here.",
          tags: ["4 months", "Normal ups and downs", "First Stay Interview"],
          agentState: "guarded-but-open",
          agentHiddenState: "has-real-concerns-not-shared",
          startMood: 42,
          agentName: 'carlos'
        }
      ],
      mid: [
        {
          id: 'stay_mid_1',
          text: "Valeria has been here for 121 days. She started very committed, but lately she has been quieter. A coworker mentioned that Valeria said she 'misses how things used to be'. It is time for her Stay Interview.",
          tags: ["Commitment going down", "Indirect signal", "Something changed"],
          agentState: "withdrawn-quiet",
          agentHiddenState: "grieving-something-lost",
          startMood: 30,
          randomTriggers: true,
          agentName: 'valeria'
        }
      ],
      adv: [
        {
          id: 'stay_adv_1',
          text: "Miguel has been here for 121 days. On the surface everything is fine. His metrics are good. But you have a gut feeling. It is time for his Stay Interview.",
          tags: ["Gut feeling", "No evidence", "It could be nothing or it could be everything"],
          agentState: "performing-well",
          agentHiddenState: "secretly-job-hunting",
          startMood: 48,
          misleading: true,
          agentName: 'miguel'
        }
      ]
    }
  },

  // ─────────────────────────────────────────
  tenure_renewal: {
    id: 'tenure_renewal',
    label: 'Tenure Renewal',
    day: 365,
    dayLabel: 'Día 365+',
    icon: '🏆',
    color: 'coral',
    owner: ['Manager', 'Training', 'Coach'],
    ownerLabel: 'Manager · Kat (Training) · Coach asignado — Comité',

    objective: `Recognize and reinforce the agent's commitment after completing one year. It is a moment of celebration, reviewing their journey, and renewing the connection with the company. It is the only intervention in a committee format — the agent feels the institutional weight of the recognition.`,

    successCriteria: [
    'The agent left feeling genuinely recognized, not just congratulated',
    'They identified at least one concrete achievement from the year together',
    'The agent has clarity about what comes next — development, goals, opportunities',
    'The connection with the company was renewed, not just celebrated'
  ],

    agentContext: `It is day 365. The agent has completed one year. They have history with the company, with the team, and with the processes. They have seen good and bad things. They know how this place really works. The Tenure Renewal IS a formal intervention — the agent knows there will be a special conversation for their anniversary.`,

    trap: `Turn it into an empty ceremony. "Congratulations on your year, here is your recognition, any questions?" The agent needs to feel that the conversation is specifically about them — not a procedure that is done with everyone.`,

    relevantTechniques: ['active_listening', 'powerful_questions'],

    scenarios: {
      novice: [
        {
          id: 'ten_nov_1',
          text: "Carlos completes one year today. He has had good overall performance. There are some areas for improvement, but overall he is an agent worth retaining. It is his Tenure Renewal.",
          tags: ["One year completed", "Good overall performance", "Worth retaining"],
          agentState: "proud-but-waiting",
          agentHiddenState: "wants-acknowledgment-of-specific-things",
          startMood: 60,
          agentName: 'carlos'
        }
      ],
      mid: [
        {
          id: 'ten_mid_1',
          text: "Sandra completes one year. It was the most difficult year of her career — process changes, a new manager, metrics that did not reflect her effort. She made it to the one-year mark. It is her Tenure Renewal.",
          tags: ["Difficult year", "Showed resilience", "May be exhausted or strengthened"],
          agentState: "exhausted-proud",
          agentHiddenState: "needs-real-acknowledgment-or-leaves",
          startMood: 40,
          randomTriggers: true,
          agentName: 'sandra'
        }
      ],
      adv: [
        {
          id: 'ten_adv_1',
          text: "Valeria completes one year. She was promoted to senior in month 8. Now she has more responsibilities but the same base salary. She has not said anything. It is her Tenure Renewal.",
          tags: ["Promoted without salary adjustment", "Has not said anything", "Potential ticking time bomb"],
          agentState: "composed-professional",
          agentHiddenState: "actively-planning-exit",
          startMood: 35,
          misleading: true,
          agentName: 'valeria'
        }
      ]
    }
  }
};

// Active intervention
let currentIntervention = null;

function setIntervention(id) {
  if (INTERVENTIONS[id]) {
    currentIntervention = INTERVENTIONS[id];
    return true;
  }
  return false;
}

function getInterventionScenarios(level) {
  if (!currentIntervention) return [];
  return currentIntervention.scenarios[level] || [];
}

function getAvailableInterventions() {
  return Object.values(INTERVENTIONS);
}
