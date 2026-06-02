// ═══════════════════════════════════════════
//  app.js
//  Core logic — Interventions OS v5
//  Depends on: interventions.js, archetypes.js,
//              techniques.js, prompts.js, api.js, ui.js
// ═══════════════════════════════════════════

// ─── GLOBAL STATE ─────────────────────────

let GROQ_KEY = localStorage.getItem('groq_key') || '';
let learnHistory    = [];
let workHistory     = [];
let practiceHistory = [];
let mood            = 30;
let boxState        = 'neutral';
let activeMode      = null;       // 'learn' | 'work' | 'practice'
let activeMenu      = null;       // 'interventions' | 'techniques'
let workSubmode     = 'reflect';
let workTimeLimit   = 3;
let hingeDoorsOpened   = [];
let directAskCount     = 0;
let currentLevel       = null;
let currentBriefing    = null;
let currentScenario    = null;    // intervention scenario object
let preReflection      = {};
let conversationClosed = false;

// ─── LEARN MODE ───────────────────────────

async function initLearn() {
  const isIntervention = activeMenu === 'interventions';
  let opener;

  if (isIntervention && currentIntervention) {
    opener = `Before we start — tell me, when was the last time you had a conversation with one of your agents where you felt it really mattered? What made it different from the usual check-in?`;
  } else {
    opener = `Before we talk about what ${currentTechnique.label} is, I want to ask you something. Think of a time when you felt truly heard — when someone was really listening to you. What was different about that conversation?`;
  }

  addMsg('learn-msgs', 'coach', opener);
  learnHistory.push({ role: 'assistant', content: opener });
  speakWithGroq(opener, 'coach');
}

async function sendLearn() {
  const inp = document.getElementById('learn-input');
  const txt = inp ? inp.value.trim() : '';
  if (!txt) return;
  if (inp) inp.value = '';
  addMsg('learn-msgs', 'user', txt);
  learnHistory.push({ role: 'user', content: txt });
  setLoading('learn-send', true);
  showTyping('learn-msgs');
  try {
    const sysPrompt = activeMenu === 'interventions'
      ? PROMPTS.learnIntervention()
      : PROMPTS.learn();
    const reply = await callGroq(learnHistory, sysPrompt);
    removeTyping();
    addMsg('learn-msgs', 'coach', reply);
    learnHistory.push({ role: 'assistant', content: reply });
    updateLearnProgress(reply);
    speakWithGroq(reply, 'coach');
  } catch (e) {
    removeTyping();
    addMsg('learn-msgs', 'coach', '[Connection error. Check your Groq key.]');
  }
  setLoading('learn-send', false);
}

async function learnHint() {
  const hint = { role: 'user', content: "Can you give me a concrete example of what this looks like in a real conversation?" };
  learnHistory.push(hint);
  showTyping('learn-msgs');
  setLoading('learn-send', true);
  try {
    const sysPrompt = activeMenu === 'interventions'
      ? PROMPTS.learnIntervention()
      : PROMPTS.learn();
    const reply = await callGroq(learnHistory, sysPrompt, 0.7);
    removeTyping();
    addMsg('learn-msgs', 'coach', reply);
    learnHistory.push({ role: 'assistant', content: reply });
    speakWithGroq(reply, 'coach');
  } catch (e) { removeTyping(); }
  setLoading('learn-send', false);
}

async function startQuiz() {
  const quizMsg = { role: 'user', content: "I think I understand. Can you check my understanding with a real scenario?" };
  learnHistory.push(quizMsg);
  addMsg('learn-msgs', 'user', "I'm ready — check my understanding.");
  showTyping('learn-msgs');
  setLoading('learn-send', true);
  try {
    const context = activeMenu === 'interventions' && currentIntervention
      ? `Give them a brief call center scenario (2-3 sentences) relevant to a ${currentIntervention.label} conversation and ask what they would do. Don't give the answer.`
      : `Give them a brief real scenario (2-3 sentences) from a call center context and ask what they would do using ${currentTechnique.label}. Don't give the answer.`;
    const sysPrompt = (activeMenu === 'interventions' ? PROMPTS.learnIntervention() : PROMPTS.learn()) + '\n\n' + context;
    const reply = await callGroq(learnHistory, sysPrompt, 0.7);
    removeTyping();
    addMsg('learn-msgs', 'coach', reply);
    learnHistory.push({ role: 'assistant', content: reply });
    speakWithGroq(reply, 'coach');
    // Show pivot
    setTimeout(() => {
      document.getElementById('learn-pivot')?.classList.add('show');
    }, 800);
  } catch (e) { removeTyping(); }
  setLoading('learn-send', false);
}

// ─── WORK TOGETHER ────────────────────────

async function initWork() {
  let opener;
  if (workSubmode === 'urgent') {
    const timeLabel = workTimeLimit === 0 ? 'some time' : `${workTimeLimit} minutes`;
    opener = `Okay, we have ${timeLabel}. Tell me quickly: who is this person, what happened, and what do you need to handle right now?`;
  } else {
    opener = "Tell me about the situation. Who is this person, and what's been going on? Don't filter — just describe it the way you'd tell a colleague.";
  }
  addMsg('work-msgs', 'coach', opener);
  workHistory.push({ role: 'assistant', content: opener });
  speakWithGroq(opener, 'coach');
}

async function sendWork() {
  const inp = document.getElementById('work-input');
  const txt = inp ? inp.value.trim() : '';
  if (!txt) return;
  if (inp) inp.value = '';
  addMsg('work-msgs', 'user', txt);
  workHistory.push({ role: 'user', content: txt });

  const directAskPhrases = ['how would you do it', 'what should i do', 'how do i do it', 'tell me what to do', 'just tell me', 'what do you suggest'];
  if (directAskPhrases.some(p => txt.toLowerCase().includes(p))) directAskCount++;

  setLoading('work-send', true);
  showTyping('work-msgs');
  try {
    let sysPrompt = workSubmode === 'urgent' ? PROMPTS.work_urgent() : PROMPTS.work();
    if (directAskCount >= 2 && workSubmode !== 'urgent') {
      sysPrompt += '\n\nThe supervisor has asked for direct guidance twice. Give ONE concrete example of what the conversation could look like, then return the question to them.';
    }
    const reply = await callGroq(workHistory, sysPrompt, 0.75);
    removeTyping();
    addMsg('work-msgs', 'coach', reply);
    workHistory.push({ role: 'assistant', content: reply });
    speakWithGroq(reply, 'coach');
  } catch (e) {
    removeTyping();
    addMsg('work-msgs', 'coach', '[Connection error.]');
  }
  setLoading('work-send', false);
}

async function workEnd() {
  const closeMsg = { role: 'user', content: "That was helpful. Give me one thing to take into my next conversation." };
  workHistory.push(closeMsg);
  addMsg('work-msgs', 'user', "One thing to take forward?");
  showTyping('work-msgs');
  try {
    const label = activeMenu === 'interventions' && currentIntervention
      ? currentIntervention.label
      : currentTechnique.label;
    const closePrompt = PROMPTS.work() + `\n\nGive them ONE specific, actionable thing grounded in ${label}. One sentence max.`;
    const reply = await callGroq(workHistory, closePrompt, 0.6);
    removeTyping();
    addMsg('work-msgs', 'coach', reply);
    workHistory.push({ role: 'assistant', content: reply });
    speakWithGroq(reply, 'coach');
  } catch (e) { removeTyping(); }
}

// ─── PRACTICE — BRIEFING ──────────────────

function goBriefing() {
  if (!currentLevel) return;

  // Get scenarios from intervention or technique mode
  let pool;
  if (activeMenu === 'interventions' && currentIntervention) {
    pool = getInterventionScenarios(currentLevel);
  } else {
    pool = getBriefingPool(currentLevel);
  }

  if (!pool || pool.length === 0) {
    alert('No scenarios available for this level yet.');
    return;
  }

  currentScenario = pool[Math.floor(Math.random() * pool.length)];
  currentBriefing = currentScenario; // backward compat

  // Set archetype based on scenario
  if (currentScenario.agentName && ARCHETYPES[currentScenario.agentName]) {
    currentArchetype = ARCHETYPES[currentScenario.agentName];
  }

  // Populate briefing screen
  document.getElementById('briefing-text').textContent = currentScenario.text;
  const meta = document.getElementById('briefing-meta');
  meta.innerHTML = currentScenario.tags.map(t => `<span class="briefing-tag">${t}</span>`).join('');

  // Show intervention context if applicable
  const intentEl = document.getElementById('briefing-intent');
  if (intentEl && activeMenu === 'interventions' && currentIntervention) {
    intentEl.style.display = 'block';
    intentEl.querySelector('.intent-label').textContent = currentIntervention.label;
    intentEl.querySelector('.intent-trap').textContent = currentIntervention.trap;
  } else if (intentEl) {
    intentEl.style.display = 'none';
  }

  document.getElementById('reflect-assume').value = '';
  show('s-briefing');
}

function startPracticeFromBriefing() {
  // Full reset
  const msgsEl = document.getElementById('practice-msgs');
  if (msgsEl) msgsEl.innerHTML = '';
  stopSpeaking();
  const assumption = document.getElementById('reflect-assume').value.trim();
  preReflection = { assume: assumption || '(not answered)' };

  practiceHistory = [];
  hingeDoorsOpened = [];
  conversationClosed = false;
  mood = currentScenario.startMood ?? 40;

  configurePracticeUI();
  show('s-practice');
  activeMode = 'practice';
  updateMood(mood);
  updateBox('neutral');
  initPractice();
}

// ─── PRACTICE — CONVERSATION ──────────────

async function initPractice() {
  const state  = currentScenario?.agentState || 'guarded-tired';
  const opener = currentArchetype.openers[state]
    || currentArchetype.openers[Object.keys(currentArchetype.openers)[0]]
    || "...Yeah? You wanted to see me?";

  addMsg('practice-msgs', 'agent', opener);
  practiceHistory.push({ role: 'assistant', content: opener });
  updateBox('neutral');

  // Speak with archetype voice
  await speakWithGroq(opener, currentArchetype.id);
}

async function sendPractice() {
  if (conversationClosed) {
    const name = currentArchetype.name.split(' ')[0];
    addMsg('practice-msgs', 'agent', `(${name} has shut down. Go to End & reflect.)`);
    return;
  }
  const inp = document.getElementById('practice-input');
  const txt = inp ? inp.value.trim() : '';
  if (!txt) return;
  if (inp) inp.value = '';

  addMsg('practice-msgs', 'user', txt);
  practiceHistory.push({ role: 'user', content: txt });
  setLoading('practice-send', true);
  showTyping('practice-msgs');

  // Build prompt with full context
  const scenarioContext = currentScenario
    ? `\n\nSITUATION: ${currentScenario.text}\nYour visible state: ${currentScenario.agentState}\nYour hidden inner state (never say this directly, but let it color your responses): ${currentScenario.agentHiddenState}`
    : '';

  const interventionContext = activeMenu === 'interventions' && currentIntervention
    ? `\n\nINTERVENTION TYPE: This is a ${currentIntervention.label} conversation (Day ${currentIntervention.day}). The person talking to you may be from: ${currentIntervention.ownerLabel}. You do NOT know this is a formal intervention — to you, someone from the company came to talk.`
    : '';

  const avatarPrompt = PROMPTS.avatar(currentLevel) + scenarioContext + interventionContext;

  try {
    const raw = await callGroq(practiceHistory, avatarPrompt);
    removeTyping();
    const { msg, newMood, box, closed, trigger } = parsePractice(raw);
    practiceHistory.push({ role: 'assistant', content: raw });
    addMsg('practice-msgs', 'agent', msg);

    // Hinge moment detection
    const hingePhrases = currentArchetype.hingePhrases || [];
    const newHinge = hingePhrases.find(p => msg.toLowerCase().includes(p) && !hingeDoorsOpened.includes(p));
    if (newHinge) {
      hingeDoorsOpened.push(newHinge);
      if (currentLevel === 'novice') {
        setTimeout(() => {
          addMsg('practice-msgs', 'system', `🚪 ${currentArchetype.name.split(' ')[0]} just opened a door — mentioned something personal. Hinge moment.`);
        }, 1200);
      }
    }

    // Random trigger (mid only)
    if (currentLevel === 'mid' && trigger && trigger !== 'none') {
      const triggerMsg = trigger === 'positive'
        ? `Something you said unexpectedly landed well.`
        : `Something you said unexpectedly hit a nerve.`;
      setTimeout(() => addMsg('practice-msgs', 'system', triggerMsg), 800);
    }

    // Fieldwork: conversation can close
    if (currentLevel === 'adv' && closed) {
      conversationClosed = true;
      const name = currentArchetype.name.split(' ')[0];
      setTimeout(() => {
        addMsg('practice-msgs', 'system', `(${name} looks away. They're done talking.)`);
      }, 600);
    }

    updateMood(newMood);
    if (currentLevel !== 'adv') updateBox(box);

    // Speak with archetype voice
    await speakWithGroq(msg, currentArchetype.id);

  } catch (e) {
    removeTyping();
    addMsg('practice-msgs', 'agent', '[Connection error.]');
  }
  setLoading('practice-send', false);
}

function parsePractice(raw) {
  const moodMatch    = raw.match(/\[MOOD:(\d+)\]/);
  const boxMatch     = raw.match(/\[BOX:(in|out)\]/);
  const closedMatch  = raw.match(/\[CLOSED:(true|false)\]/);
  const triggerMatch = raw.match(/\[TRIGGER:(none|positive|negative)\]/);
  const newMood  = moodMatch    ? parseInt(moodMatch[1])  : mood;
  const box      = boxMatch     ? boxMatch[1]             : 'neutral';
  const closed   = closedMatch  ? closedMatch[1] === 'true' : false;
  const trigger  = triggerMatch ? triggerMatch[1]         : 'none';
  const msg = raw
    .replace(/\[MOOD:\d+\]/g, '')
    .replace(/\[BOX:(in|out)\]/g, '')
    .replace(/\[CLOSED:(true|false)\]/g, '')
    .replace(/\[TRIGGER:(none|positive|negative)\]/g, '')
    .trim();
  return { msg, newMood, box, closed, trigger };
}

async function practiceHint() {
  if (currentLevel === 'adv') return;
  if (currentLevel === 'mid') {
    updateMood(mood - 5);
    const name = currentArchetype.name.split(' ')[0];
    addMsg('practice-msgs', 'system', `(${name} notices you seem unsure — −5 openness)`);
  }
  const hints = currentTechnique.hints;
  const hint = mood < 35 ? hints.low : mood < 60 ? hints.mid : hints.high;
  setTimeout(() => addMsg('practice-msgs', 'system', `💡 ${hint}`), currentLevel === 'mid' ? 800 : 0);
}

// ─── EVALUATION ───────────────────────────

async function goEval() {
  show('s-eval');
  document.getElementById('eval-content').innerHTML = `
    <div class="insight-card ic-teal">
      <div class="ic-label">Analyzing your session...</div>
      <div>Reading the conversation — this takes a moment.</div>
    </div>`;

  const agentFirstName = currentArchetype.name.split(' ')[0].toUpperCase();
  const transcript = practiceHistory
    .map(m => `${m.role === 'user' ? 'YOU' : agentFirstName}: ${m.content}`)
    .join('\n');

  const interventionLabel = activeMenu === 'interventions' && currentIntervention
    ? currentIntervention.label
    : null;

  const evalPrompt = PROMPTS.eval(
    currentScenario?.text || 'Standard scenario',
    currentScenario?.agentState || 'guarded',
    currentScenario?.agentHiddenState || 'unknown',
    preReflection.assume || '(none)',
    mood, boxState, conversationClosed, hingeDoorsOpened, currentLevel,
    interventionLabel
  );

  try {
    const raw = await callGroq(
      [{ role: 'user', content: `Transcript:\n${transcript}\n\nAnalyze this session.` }],
      evalPrompt, 0.4
    );
    const sections = parseEval(raw);
    const recapHTML = buildRecapHTML(raw);

    const interventionNote = interventionLabel
      ? `<div class="insight-card" style="background:var(--teal-dim);border-left-color:var(--teal);margin-bottom:8px;">
          <div class="ic-label" style="color:var(--teal);">Intervention · ${interventionLabel}</div>
          <div style="font-size:12px;color:var(--text2);">${currentIntervention?.trap || ''}</div>
         </div>`
      : '';

    // Effectiveness color — coral if they avoided, teal if they achieved
    const effectivenessColor = sections.effectiveness?.toLowerCase().includes('avoided') ||
      sections.effectiveness?.toLowerCase().includes('conflict avoidance') ||
      sections.effectiveness?.toLowerCase().includes('did not achieve') ||
      sections.effectiveness?.toLowerCase().includes("didn't achieve")
      ? 'var(--coral)' : 'var(--teal)';

    document.getElementById('eval-content').innerHTML = `
      ${interventionNote}
      <div class="insight-card ic-teal">
        <div class="ic-label">What landed</div>
        <div>${sections.landed}</div>
      </div>
      <div class="insight-card ic-amber">
        <div class="ic-label">Moments to look at</div>
        <div>${sections.look}</div>
      </div>
      <div class="insight-card" style="background:var(--purple-dim);border-left-color:var(--purple);">
        <div class="ic-label" style="color:var(--purple);">Assumption check</div>
        <div>${sections.assumption || 'Your pre-briefing assumptions were not clearly tested in this session.'}</div>
      </div>
      <div class="insight-card" style="background:${effectivenessColor === 'var(--coral)' ? 'var(--coral-dim)' : 'var(--teal-dim)'};border-left-color:${effectivenessColor};">
        <div class="ic-label" style="color:${effectivenessColor};">Effectiveness — did you achieve the objective?</div>
        <div>${sections.effectiveness || 'Not enough conversation data to assess effectiveness.'}</div>
        <div style="margin-top:8px;font-size:11px;color:var(--text3);border-top:0.5px solid rgba(255,255,255,0.08);padding-top:6px;">
          High openness ≠ effectiveness. Saying yes to everything keeps mood high but avoids the real conversation.
        </div>
      </div>
      <div class="insight-card ic-blue">
        <div class="ic-label">One thing to carry forward</div>
        <div>${sections.carry}</div>
      </div>
      <div class="box-meter" style="margin-top:12px;">
        <div class="box-label">How you showed up overall</div>
        <div class="box-indicator ${boxState === 'out' ? 'out-box' : boxState === 'in' ? 'in-box' : ''}">
          ${boxState === 'out' ? 'Mostly out of the box ✓' : boxState === 'in' ? 'Mostly in the box — worth reflecting on' : 'Mixed — good starting point'}
        </div>
      </div>
      <div class="recap-section">
        <button class="recap-toggle" onclick="toggleRecap(this)">
          <span>📋 ${currentTechnique.label} — technique breakdown</span>
          <span>▾</span>
        </button>
        <div class="recap-points" id="recap-points">${recapHTML}</div>
      </div>`;

    saveSessionProgress({
      intervention: currentIntervention?.id || null,
      archetype: currentArchetype.id,
      technique: currentTechnique.id,
      level: currentLevel,
      moodFinal: mood,
      boxFinal: boxState,
      evalSummary: sections.carry,
      completedAt: Date.now()
    });

  } catch (e) {
    const name = currentArchetype.name.split(' ')[0];
    document.getElementById('eval-content').innerHTML = `
      <div class="insight-card ic-teal">
        <div class="ic-label">Session complete</div>
        <div>${name}'s openness ended at ${mood}%. ${mood > 50 ? "You moved them — something created space for them to open up." : "They stayed guarded. Were you listening to understand, or to respond?"}</div>
      </div>
      <div class="insight-card ic-blue">
        <div class="ic-label">One thing to try next time</div>
        <div>Before speaking, reflect back what they said. Name the emotion you heard: "It sounds like you're frustrated because..." — then stop. Don't fix it. Just name it.</div>
      </div>`;
  }
}

function buildRecapHTML(raw) {
  return currentTechnique.evalMoves.map(move => {
    const pattern = new RegExp(`MOVE:\\s*${move.key}[\\s\\S]*?WHAT IT IS:\\s*([^\\n]+)[\\s\\S]*?IN YOUR CONVERSATION:\\s*([^\\n]+)[\\s\\S]*?EXAMPLE:\\s*([^\\n]+)`, 'i');
    const match = raw.match(pattern);
    const whatItIs = match ? match[1].trim() : move.defaultDef;
    const inConvo  = match ? match[2].trim() : 'Not enough data from this session.';
    const example  = match ? match[3].trim() : move.defaultExample;
    return `
      <div class="recap-point">
        <div class="recap-point-title" style="color:${move.color};">${move.label}</div>
        <div><strong>What it is:</strong> ${whatItIs}</div>
        <div style="margin-top:5px;"><strong>In your conversation:</strong> ${inConvo}</div>
        <div class="recap-point-moment"><strong>Sounds like:</strong> "${example}"</div>
      </div>`;
  }).join('');
}

function parseEval(raw) {
  const m1 = raw.match(/1[.)]\s*([\s\S]*?)(?=2[.)]|$)/i);
  const m2 = raw.match(/2[.)]\s*([\s\S]*?)(?=3[.)]|$)/i);
  const m3 = raw.match(/3[.)]\s*([\s\S]*?)(?=4[.)]|$)/i);
  const m4 = raw.match(/4[.)]\s*([\s\S]*?)(?=5[.)]|$)/i);
  const m5 = raw.match(/5[.)]\s*([\s\S]*?)(?=MOVE:|TECHNIQUE|$)/i);
  const landedMatch        = raw.match(/WHAT LANDED:?\s*([\s\S]*?)(?=WHAT TO LOOK|ASSUMPTION|EFFECTIVENESS|ONE THING|2[.)]|$)/i);
  const lookMatch          = raw.match(/WHAT TO LOOK.*?:?\s*([\s\S]*?)(?=ASSUMPTION|EFFECTIVENESS|ONE THING|3[.)]|$)/i);
  const assumptionMatch    = raw.match(/ASSUMPTION CHECK:?\s*([\s\S]*?)(?=EFFECTIVENESS|ONE THING|4[.)]|$)/i);
  const effectivenessMatch = raw.match(/EFFECTIVENESS:?\s*([\s\S]*?)(?=ONE THING|5[.)]|MOVE:|TECHNIQUE|$)/i);
  const carryMatch         = raw.match(/ONE THING.*?:?\s*([\s\S]*?)(?=MOVE:|TECHNIQUE|$)/i);
  return {
    landed:        (m1?.[1] || landedMatch?.[1]        || '').replace(/^WHAT LANDED:?\s*/i,'').trim(),
    look:          (m2?.[1] || lookMatch?.[1]           || '').replace(/^WHAT TO LOOK.*?:?\s*/i,'').trim(),
    assumption:    (m3?.[1] || assumptionMatch?.[1]     || '').replace(/^ASSUMPTION CHECK:?\s*/i,'').trim(),
    effectiveness: (m4?.[1] || effectivenessMatch?.[1]  || '').replace(/^EFFECTIVENESS:?\s*/i,'').trim(),
    carry:         (m5?.[1] || carryMatch?.[1]          || '').replace(/^ONE THING.*?:?\s*/i,'').trim()
  };
}
