// ═══════════════════════════════════════════
//  preview.js
//  Technique & Intervention preview system
//  Juanjolote (Coach) + Ajolin (Agent)
//  Animated SVG axolotl characters
//  60 seconds max — Bad example → Good example → Key moves → Join
// ═══════════════════════════════════════════

// ─── AXOLOTL SVG BUILDER ──────────────────
// Juanjolote = coach (teal gills, badge)
// Ajolin = agent (coral gills, reactive expressions)

function buildAxolotlSVG(name, mood = 'neutral', role = 'coach', size = 80) {
  const isJuan = name === 'juanjolote';
  const gillColor  = isJuan ? '#1ec99a' : '#ff6b6b';
  const bodyColor  = isJuan ? '#b8e6d4' : '#f4c2b0';
  const eyeColor   = isJuan ? '#0a4a35' : '#4a0a0a';
  const badgeColor = isJuan ? '#1ec99a' : '#ff6b6b';

  // Mouth shape by mood
  const mouths = {
    neutral:  'M 38 58 Q 42 61 46 58',
    happy:    'M 36 56 Q 42 64 48 56',
    sad:      'M 36 62 Q 42 56 48 62',
    talking:  'M 37 57 Q 42 63 47 57 Q 42 68 37 57',
    angry:    'M 36 60 Q 42 55 48 60',
    open:     'M 38 56 Q 42 65 46 56 Q 42 70 38 56',
    thinking: 'M 38 59 Q 44 62 47 58'
  };

  // Eye shape by mood
  const eyes = {
    neutral:  { left: 'cx="34" cy="44" rx="5" ry="5"', right: 'cx="50" cy="44" rx="5" ry="5"' },
    happy:    { left: 'cx="34" cy="44" rx="5" ry="3"', right: 'cx="50" cy="44" rx="5" ry="3"' },
    sad:      { left: 'cx="34" cy="46" rx="5" ry="5"', right: 'cx="50" cy="46" rx="5" ry="5"' },
    angry:    { left: 'cx="34" cy="43" rx="5" ry="4"', right: 'cx="50" cy="43" rx="5" ry="4"' },
    thinking: { left: 'cx="34" cy="44" rx="5" ry="5"', right: 'cx="50" cy="42" rx="5" ry="3"' },
    talking:  { left: 'cx="34" cy="44" rx="5" ry="5"', right: 'cx="50" cy="44" rx="5" ry="5"' },
    open:     { left: 'cx="34" cy="44" rx="6" ry="6"', right: 'cx="50" cy="44" rx="6" ry="6"' }
  };

  const m = mouths[mood]  || mouths.neutral;
  const e = eyes[mood]    || eyes.neutral;
  const flipX = isJuan ? '' : 'transform="scale(-1,1) translate(-84,0)"';

  return `<svg width="${size}" height="${size}" viewBox="0 0 84 84" xmlns="http://www.w3.org/2000/svg">
  <g ${flipX}>
    <!-- Gills -->
    <ellipse cx="18" cy="30" rx="7" ry="14" fill="${gillColor}" opacity="0.8"/>
    <ellipse cx="24" cy="22" rx="5" ry="11" fill="${gillColor}" opacity="0.6"/>
    <ellipse cx="66" cy="30" rx="7" ry="14" fill="${gillColor}" opacity="0.8"/>
    <ellipse cx="60" cy="22" rx="5" ry="11" fill="${gillColor}" opacity="0.6"/>
    <!-- Body -->
    <ellipse cx="42" cy="52" rx="22" ry="18" fill="${bodyColor}"/>
    <!-- Head -->
    <ellipse cx="42" cy="44" rx="20" ry="18" fill="${bodyColor}"/>
    <!-- Eyes white -->
    <ellipse ${e.left}  fill="white"/>
    <ellipse ${e.right} fill="white"/>
    <!-- Pupils -->
    <circle cx="35" cy="44" r="2.5" fill="${eyeColor}"/>
    <circle cx="51" cy="44" r="2.5" fill="${eyeColor}"/>
    <!-- Eye shine -->
    <circle cx="36" cy="43" r="1" fill="white" opacity="0.8"/>
    <circle cx="52" cy="43" r="1" fill="white" opacity="0.8"/>
    <!-- Mouth -->
    <path d="${m}" stroke="${eyeColor}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <!-- Spots -->
    <circle cx="36" cy="52" r="2" fill="${gillColor}" opacity="0.3"/>
    <circle cx="48" cy="55" r="1.5" fill="${gillColor}" opacity="0.3"/>
    <!-- Tail -->
    <path d="M 20 65 Q 10 75 18 78 Q 26 72 30 68" fill="${bodyColor}" stroke="${gillColor}" stroke-width="0.5"/>
    <!-- Badge -->
    <rect x="28" y="68" width="28" height="12" rx="6" fill="${badgeColor}"/>
    <text x="42" y="77" text-anchor="middle" font-size="6" font-weight="700" fill="white" font-family="system-ui">${isJuan ? 'COACH' : 'AGENT'}</text>
  </g>
</svg>`;
}

// ─── PREVIEW DATA PER TECHNIQUE ───────────────────────────

const TECHNIQUE_PREVIEWS = {

  active_listening: {
    title: 'Active Listening',
    tagline: "It's not about hearing — it's about making them feel heard.",
    roleA: 'Coach',
    bad: {
      label: "Without Active Listening",
      context: "Agent mentions they've been arriving late.",
      exchanges: [
        { speaker: 'A', mood: 'neutral',  text: "Carlos, I noticed you've been late three times this week." },
        { speaker: 'B', mood: 'angry',    text: "I had to take my kid to the hospital, it's not like I wanted to be late." },
        { speaker: 'A', mood: 'neutral',  text: "I understand, but tardiness affects the whole team's metrics." },
        { speaker: 'B', mood: 'sad',      text: "...Sure. Got it." }
      ],
      insight: "The coach heard the words but missed the person. Carlos shut down."
    },
    good: {
      label: "With Active Listening",
      context: "Same situation. Different stance.",
      exchanges: [
        { speaker: 'A', mood: 'neutral',  text: "Carlos, I noticed you've been late a few times. I wanted to check in — how are you doing?" },
        { speaker: 'B', mood: 'thinking', text: "Honestly... my kid's been sick. Hospital visits in the morning." },
        { speaker: 'A', mood: 'happy',    text: "That sounds really hard. I can only imagine how stressful that's been." },
        { speaker: 'B', mood: 'open',     text: "Yeah... it's been a lot. I'm trying to figure it out." },
        { speaker: 'A', mood: 'talking',  text: "I hear you. Let's figure out something together that works for your family and the team." }
      ],
      insight: "Same facts. Totally different outcome — because Carlos felt seen, not managed."
    },
    moves: [
      { icon: '👁', label: 'Pay Attention', desc: 'Be fully present — no phone, no planning your next line' },
      { icon: '🔄', label: 'Reflect Back', desc: 'Repeat the core of what you heard in your own words' },
      { icon: '✅', label: 'Validate', desc: "Acknowledge their feeling makes sense — even if you disagree" },
      { icon: '📋', label: 'Summarize', desc: 'Recap before you respond — prevents misunderstanding' }
    ]
  },

  powerful_questions: {
    title: 'Powerful Questions',
    tagline: "The right question opens what the right answer never could.",
    roleA: 'Coach',
    bad: {
      label: "Weak Questions",
      context: "Stay Interview — checking in with an agent.",
      exchanges: [
        { speaker: 'A', mood: 'neutral',  text: "Do you like working here?" },
        { speaker: 'B', mood: 'neutral',  text: "Yeah, it's fine." },
        { speaker: 'A', mood: 'neutral',  text: "Are you happy with your schedule?" },
        { speaker: 'B', mood: 'neutral',  text: "Sure." },
        { speaker: 'A', mood: 'happy',    text: "Great! Thanks for the chat." }
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
      { icon: '🚪', label: 'Open Questions', desc: 'Start with What or How — never Why (it sounds like blame)' },
      { icon: '🔍', label: 'Surface Assumptions', desc: 'Ask what they take for granted about the situation' },
      { icon: '🔮', label: 'Forward-Facing', desc: 'Ask about possibility, not just what went wrong' },
      { icon: '🤫', label: 'Hold Silence', desc: 'After a powerful question, resist filling the space' }
    ]
  },

  radical_candor: {
    title: 'Radical Candor',
    tagline: "Care personally. Challenge directly. Both — at the same time.",
    roleA: 'Manager',
    bad: {
      label: "Ruinous Empathy",
      context: "Agent's performance has been slipping. Manager avoids the conversation.",
      exchanges: [
        { speaker: 'A', mood: 'happy',    text: "Hey! Just wanted to say you're doing great. Keep it up!" },
        { speaker: 'B', mood: 'neutral',  text: "...Thanks?" },
        { speaker: 'A', mood: 'neutral',  text: "(3 weeks later) We need to talk about your numbers..." },
        { speaker: 'B', mood: 'angry',    text: "Why didn't you say something sooner?!" }
      ],
      insight: "Avoiding the hard conversation felt kind. It wasn't."
    },
    good: {
      label: "Radical Candor",
      context: "Same situation. Direct and caring.",
      exchanges: [
        { speaker: 'A', mood: 'talking',  text: "I want to talk about something because I think you can do better — and I think you know it too." },
        { speaker: 'B', mood: 'thinking', text: "...Yeah, I know my numbers have been off." },
        { speaker: 'A', mood: 'happy',    text: "I'm not bringing this up to pressure you. I'm bringing it up because I see what you're capable of." },
        { speaker: 'B', mood: 'open',     text: "That actually... means a lot. I've been struggling with something." }
      ],
      insight: "Honest AND caring. The challenge landed because the care was real."
    },
    moves: [
      { icon: '❤️', label: 'Care Personally', desc: 'Know them as a human, not just as a performance metric' },
      { icon: '🎯', label: 'Challenge Directly', desc: 'Say the thing that needs saying — clearly, not harshly' },
      { icon: '⚡', label: 'Be Specific', desc: 'Point to a real moment, not a general pattern' },
      { icon: '🔁', label: 'Invite Response', desc: 'Give them space to react — this is a conversation, not a verdict' }
    ]
  },

  motivational_interviewing: {
    title: 'Motivational Interviewing',
    tagline: "Their reasons for change are more powerful than yours.",
    roleA: 'Coach',
    bad: {
      label: "Persuasion mode",
      context: "Agent keeps missing targets. Coach tries to convince them.",
      exchanges: [
        { speaker: 'A', mood: 'talking',  text: "You really need to hit your numbers. It matters for your review." },
        { speaker: 'B', mood: 'neutral',  text: "I know, I know." },
        { speaker: 'A', mood: 'neutral',  text: "If you just focused more during calls, you'd get there." },
        { speaker: 'B', mood: 'angry',    text: "I am focused. I don't know what you want from me." }
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
      { icon: '❓', label: 'Elicit Change Talk', desc: 'Ask what change would mean for them, not for you' },
      { icon: '📊', label: 'Explore Importance', desc: '"On a scale of 1-10, how important is this to you? Why not lower?"' },
      { icon: '🚀', label: 'Build on Strengths', desc: 'Reference what they have already done — not what they lack' }
    ]
  }
};

// ─── PREVIEW STATE ────────────────────────

let previewStep = 0;       // 0=bad, 1=good, 2=moves, 3=join
let previewExIdx = 0;      // current exchange index
let previewTimer = null;
let previewData  = null;

// ─── RENDER PREVIEW SCREEN ────────────────

function showTechniquePreview(techniqueId) {
  previewData = TECHNIQUE_PREVIEWS[techniqueId];
  if (!previewData) {
    // No preview yet — go straight to mode screen
    show('s-mode');
    return;
  }
  previewStep  = 0;
  previewExIdx = 0;
  renderPreviewStep();
  show('s-preview');
}

function renderPreviewStep() {
  const el = document.getElementById('preview-stage');
  if (!el || !previewData) return;

  if (previewStep === 0) renderPreviewConvo(el, previewData.bad, false);
  else if (previewStep === 1) renderPreviewConvo(el, previewData.good, true);
  else if (previewStep === 2) renderPreviewMoves(el);
  else if (previewStep === 3) renderPreviewJoin(el);

  // Update step indicators
  for (let i = 0; i < 4; i++) {
    const dot = document.getElementById(`pdot-${i}`);
    if (dot) {
      dot.classList.toggle('active', i === previewStep);
      dot.classList.toggle('done', i < previewStep);
    }
  }
}

function renderPreviewConvo(el, data, isGood) {
  const accentColor = isGood ? 'var(--teal)' : 'var(--coral)';
  const labelIcon   = isGood ? '✅' : '❌';

  el.innerHTML = `
    <div class="preview-label" style="color:${accentColor};">
      ${labelIcon} ${data.label}
    </div>
    <div class="preview-context">${data.context}</div>
    <div class="preview-scene">
      <div class="preview-chars">
        <div class="preview-char" id="prev-juan">
          ${buildAxolotlSVG('juanjolote', 'neutral', 'coach', 72)}
          <div class="char-name">Juanjolote</div>
          <div class="char-role">${previewData.roleA}</div>
        </div>
        <div class="preview-char" id="prev-ajolin">
          ${buildAxolotlSVG('ajolin', 'neutral', 'agent', 72)}
          <div class="char-name">Ajolin</div>
          <div class="char-role">Agent</div>
        </div>
      </div>
      <div class="preview-bubble-wrap" id="preview-bubble">
        <div class="preview-bubble-inner">
          <span class="bubble-speaker" id="bubble-speaker"></span>
          <span class="bubble-text" id="bubble-text"></span>
        </div>
      </div>
    </div>
    <div class="preview-insight" id="preview-insight" style="display:none;">
      <span style="color:${accentColor};">💡</span> ${data.insight}
    </div>
    <div class="preview-nav">
      <button class="preview-next-btn" id="preview-next-btn" onclick="nextExchange()">
        Next <span style="opacity:.6;font-size:12px;">▶</span>
      </button>
    </div>`;

  // Start exchange sequence
  previewExIdx = 0;
  showExchange(data.exchanges);
}

function showExchange(exchanges) {
  if (previewExIdx >= exchanges.length) {
    // Show insight
    const insight = document.getElementById('preview-insight');
    if (insight) insight.style.display = 'flex';
    const btn = document.getElementById('preview-next-btn');
    if (btn) btn.textContent = previewStep === 0 ? 'See it done right →' : 'See the moves →';
    return;
  }

  const ex       = exchanges[previewExIdx];
  const isJuan   = ex.speaker === 'A';
  const speakerName = isJuan ? 'Juanjolote' : 'Ajolin';
  const bubbleEl    = document.getElementById('preview-bubble');
  const speakerEl   = document.getElementById('bubble-speaker');
  const textEl      = document.getElementById('bubble-text');
  const juanEl      = document.getElementById('prev-juan');
  const ajolinEl    = document.getElementById('prev-ajolin');

  // Update bubble
  if (bubbleEl) bubbleEl.className = `preview-bubble-wrap ${isJuan ? 'from-juan' : 'from-ajolin'}`;
  if (speakerEl) speakerEl.textContent = speakerName + ': ';
  if (textEl) textEl.textContent = ex.text;

  // Update axolotl expressions
  if (juanEl)   juanEl.innerHTML   = buildAxolotlSVG('juanjolote', isJuan ? ex.mood : 'neutral', 'coach', 72) + `<div class="char-name">Juanjolote</div><div class="char-role">${previewData.roleA}</div>`;
  if (ajolinEl) ajolinEl.innerHTML = buildAxolotlSVG('ajolin', !isJuan ? ex.mood : 'neutral', 'agent', 72) + `<div class="char-name">Ajolin</div><div class="char-role">Agent</div>`;

  // Highlight active speaker
  if (juanEl)   juanEl.style.opacity   = isJuan  ? '1' : '0.5';
  if (ajolinEl) ajolinEl.style.opacity = !isJuan ? '1' : '0.5';
}

function nextExchange() {
  if (!previewData) return;
  const exchanges = previewStep === 0 ? previewData.bad.exchanges : previewData.good.exchanges;

  if (previewExIdx < exchanges.length) {
    previewExIdx++;
    showExchange(exchanges);
    return;
  }

  // Move to next step
  previewStep++;
  previewExIdx = 0;
  renderPreviewStep();
}

function renderPreviewMoves(el) {
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

function renderPreviewJoin(el) {
  const t = currentTechnique;
  el.innerHTML = `
    <div style="text-align:center;margin-bottom:20px;">
      <div style="font-size:40px;margin-bottom:8px;">${t.icon}</div>
      <div style="font-size:18px;font-weight:700;color:var(--text);margin-bottom:4px;">${t.label}</div>
      <div style="font-size:13px;color:var(--text2);">${t.tagline}</div>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:8px;">
      ${buildAxolotlSVG('juanjolote','happy','coach',48)}
      ${buildAxolotlSVG('ajolin','happy','agent',48)}
    </div>
    <div class="choice-grid" style="margin-top:16px;">
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

  // Stats summary
  const totalSessions = sessions.length;
  const avgMood = Math.round(sessions.reduce((s, x) => s + (x.moodFinal || 0), 0) / totalSessions);
  const outOfBox = sessions.filter(s => s.boxFinal === 'out').length;
  const techniques = [...new Set(sessions.map(s => s.technique).filter(Boolean))];
  const interventions = [...new Set(sessions.map(s => s.intervention).filter(Boolean))];

  el.innerHTML = `
    <div class="history-stats">
      <div class="stat-card">
        <div class="stat-num">${totalSessions}</div>
        <div class="stat-lbl">Sessions</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">${avgMood}%</div>
        <div class="stat-lbl">Avg Openness</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">${outOfBox}</div>
        <div class="stat-lbl">Out of Box</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">${techniques.length + interventions.length}</div>
        <div class="stat-lbl">Topics covered</div>
      </div>
    </div>

    <div style="margin:16px 0 8px;">
      <span class="label-sm">Recent sessions</span>
    </div>

    ${sessions.slice(0, 10).map(s => {
      const date = s.completedAt ? new Date(s.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';
      const context = s.intervention
        ? (INTERVENTIONS[s.intervention]?.label || s.intervention)
        : (TECHNIQUES[s.technique]?.label || s.technique || '—');
      const levelColors = { novice: 'var(--teal)', mid: 'var(--amber)', adv: 'var(--coral)' };
      const levelColor = levelColors[s.level] || 'var(--text3)';
      const moodColor = (s.moodFinal || 0) < 35 ? 'var(--coral)' : (s.moodFinal || 0) < 60 ? 'var(--amber)' : 'var(--teal)';
      const archetypeName = s.archetype ? (ARCHETYPES[s.archetype]?.name?.split(' ')[0] || s.archetype) : '—';

      return `
        <div class="history-row">
          <div class="history-date">${date}</div>
          <div class="history-main">
            <div class="history-context">${context}</div>
            <div class="history-meta">
              <span style="color:${levelColor};font-size:10px;font-weight:600;text-transform:uppercase;">${s.level || '—'}</span>
              <span style="color:var(--text3);font-size:10px;margin:0 4px;">·</span>
              <span style="font-size:10px;color:var(--text3);">${archetypeName}</span>
            </div>
            ${s.evalSummary ? `<div class="history-insight">"${s.evalSummary.substring(0, 80)}${s.evalSummary.length > 80 ? '...' : ''}"</div>` : ''}
          </div>
          <div class="history-mood" style="color:${moodColor};">${s.moodFinal || 0}%</div>
        </div>`;
    }).join('')}

    ${sessions.length > 10 ? `<div style="text-align:center;font-size:11px;color:var(--text3);margin-top:8px;">+ ${sessions.length - 10} more sessions</div>` : ''}
  `;
}
