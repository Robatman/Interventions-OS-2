// ═══════════════════════════════════════════
//  ui.js — Leadership OS v5 FIXED
//  - Eliminada pantalla de Groq API key setup
//  - La key vive solo en Vercel env vars
//  - Login va directo a welcome
// ═══════════════════════════════════════════

// ─── APP INIT ─────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
  const loggedIn = await initAuth();
  if (loggedIn) {
    goWelcome();
  } else {
    show('s-login');
  }
});

// ─── AUTH SCREENS ─────────────────────────

function showLoginScreen() {
  show('s-login');
  document.getElementById('login-error').textContent = '';
  document.getElementById('login-gameid').value  = '';
  document.getElementById('login-password').value = '';
}

function showRegisterScreen() {
  show('s-register');
  document.getElementById('register-error').textContent = '';
  document.getElementById('register-gameid').value    = '';
  document.getElementById('register-password').value  = '';
  document.getElementById('register-password2').value = '';
  document.getElementById('register-preview').textContent = '';
}

function onGameIdInput(inputEl, previewId) {
  const raw       = inputEl.value;
  const formatted = formatGameId(raw);
  inputEl.value   = formatted;

  const preview = document.getElementById(previewId);
  if (!preview) return;

  if (formatted.length >= 4 && validateGameId(formatted)) {
    const parsed = parseGameId(formatted);
    preview.textContent = `${parsed.roleName} · ${parsed.nameInitial}. ${parsed.lastName}`;
    preview.style.color = 'var(--teal)';
    inputEl.classList.remove('error');
  } else if (formatted.length > 1) {
    preview.textContent = 'Format: RoleInitial.LASTNAME — e.g. CM.RODRIGUEZ';
    preview.style.color = 'var(--text3)';
  } else {
    preview.textContent = '';
  }
}

async function submitLogin() {
  const gameId   = document.getElementById('login-gameid').value.trim().toUpperCase();
  const password = document.getElementById('login-password').value;
  const errEl    = document.getElementById('login-error');
  const btn      = document.getElementById('login-btn');

  errEl.textContent = '';

  if (!validateGameId(gameId)) {
    errEl.textContent = 'Invalid Game ID format. Example: CM.RODRIGUEZ';
    return;
  }
  if (!password) {
    errEl.textContent = 'Enter your password.';
    return;
  }

  btn.disabled    = true;
  btn.textContent = 'Connecting...';

  try {
    await loginUser(gameId, password);

    if (currentProfile && currentProfile.is_active === false) {
      await logoutUser();
      errEl.textContent = 'Your account has been disabled. Contact your admin.';
      btn.disabled    = false;
      btn.textContent = 'Enter →';
      return;
    }

    goWelcome();
  } catch (e) {
    errEl.textContent = 'Incorrect Game ID or password.';
    btn.disabled    = false;
    btn.textContent = 'Enter →';
  }
}

async function submitRegister() {
  const gameId   = document.getElementById('register-gameid').value.trim().toUpperCase();
  const password = document.getElementById('register-password').value;
  const password2= document.getElementById('register-password2').value;
  const errEl    = document.getElementById('register-error');
  const btn      = document.getElementById('register-btn');

  errEl.textContent = '';

  if (!validateGameId(gameId)) {
    errEl.textContent = 'Invalid Game ID. Format: RoleInitial.LASTNAME — e.g. CM.RODRIGUEZ';
    return;
  }
  if (password.length < 6) {
    errEl.textContent = 'Password must be at least 6 characters.';
    return;
  }
  if (password !== password2) {
    errEl.textContent = 'Passwords do not match.';
    return;
  }

  btn.disabled    = true;
  btn.textContent = 'Creating account...';

  try {
    await registerUser(gameId, password);
    goWelcome();
  } catch (e) {
    const msg = e.message || '';
    if (msg.includes('already') || msg.includes('duplicate')) {
      errEl.textContent = 'That Game ID is already registered. Try logging in.';
    } else {
      errEl.textContent = msg || 'Registration failed. Try again.';
    }
    btn.disabled    = false;
    btn.textContent = 'Create account →';
  }
}

async function submitLogout() {
  await logoutUser();
  show('s-login');
}

// ─── SCREEN NAVIGATION ────────────────────

function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
  window.scrollTo(0, 0);
}

function goWelcome() {
  const gameId   = getGameId();
  const statusEl = document.getElementById('welcome-user-status');
  if (statusEl && gameId) {
    statusEl.textContent = `${gameId} · ${currentProfile?.display_name || ''}`;
  }

  const adminBtn = document.getElementById('welcome-admin-btn');
  if (adminBtn) adminBtn.style.display = isAdmin() ? 'block' : 'none';

  show('s-welcome');
  activeMode = null;
  activeMenu = null;
  stopSpeaking();
}

function goInterventionMenu() {
  activeMenu = 'interventions';
  show('s-interventions');
}

function goTechniqueMenu() {
  activeMenu = 'techniques';
  show('s-techniques');
}

function goBack() {
  if (activeMenu === 'interventions') show('s-interventions');
  else show('s-techniques');
}

function selectIntervention(id) {
  setIntervention(id);
  updateModeScreen();
  show('s-mode');
}

function selectTechnique(id) {
  if (!setTechnique(id)) return;
  updateModeScreen();
  show('s-mode');
}

function updateModeScreen() {
  const isIntervention = activeMenu === 'interventions' && currentIntervention;
  const isTechnique    = activeMenu === 'techniques'    && currentTechnique;

  const iconEl     = document.getElementById('mode-icon');
  const titleEl    = document.getElementById('mode-title');
  const subtitleEl = document.getElementById('mode-subtitle');
  const pillEl     = document.getElementById('mode-context-pill');
  const backBtn    = document.getElementById('mode-back-btn');

  if (isIntervention) {
    iconEl.textContent     = currentIntervention.icon;
    titleEl.textContent    = currentIntervention.label;
    subtitleEl.textContent = `${currentIntervention.dayLabel} · ${currentIntervention.ownerLabel}`;
    pillEl.textContent     = 'Intervención';
    pillEl.className       = 'mode-pill mp-practice';
    backBtn.onclick        = () => show('s-interventions');
  } else if (isTechnique) {
    iconEl.textContent     = currentTechnique.icon;
    titleEl.textContent    = currentTechnique.label;
    subtitleEl.textContent = currentTechnique.tagline;
    pillEl.textContent     = 'Técnica';
    pillEl.className       = 'mode-pill mp-work';
    backBtn.onclick        = () => show('s-techniques');
  }
}

function goLearn() {
  show('s-learn');
  activeMode = 'learn';
  learnHistory = [];
  document.getElementById('learn-msgs').innerHTML = '';
  document.getElementById('learn-pivot')?.classList.remove('show');
  updateLearnHeader();
  initLearn();
}

function goWork() {
  show('s-work');
  activeMode = 'work';
  workHistory = [];
  directAskCount = 0;
  workSubmode = 'reflect';
  document.getElementById('work-msgs').innerHTML = '';
  document.getElementById('submode-reflect').classList.add('active');
  document.getElementById('submode-urgent').classList.remove('active');
  document.getElementById('work-time-row').style.display = 'none';
  initWork();
}

function goPractice() {
  show('s-level');
  activeMode = null;
  document.querySelectorAll('.level-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('level-next-btn').disabled = true;
  currentLevel = null;
  updateLevelScreen();
}

// ─── LEARN HEADER ─────────────────────────

function updateLearnHeader() {
  const isIntervention = activeMenu === 'interventions' && currentIntervention;
  const nameEl  = document.getElementById('learn-technique-name');
  const philEl  = document.getElementById('learn-philosophy');
  const stepsEl = document.getElementById('learn-steps');

  if (isIntervention) {
    nameEl.textContent = `Alex — Teaching ${currentIntervention.label}`;
    philEl.textContent = `${currentIntervention.dayLabel} · ${currentIntervention.ownerLabel}`;
    stepsEl.innerHTML  = `
      <span class="learn-step active" id="ls-1">1. Por qué importa</span>
      <span class="learn-step" id="ls-2">2. Cómo se ve bien</span>
      <span class="learn-step" id="ls-3">3. El trampón</span>
      <span class="learn-step" id="ls-4">4. Practica</span>`;
  } else {
    const t = currentTechnique;
    nameEl.textContent = `${t.coachName} — Teaching ${t.label}`;
    philEl.textContent = `Based on ${t.philosophy}`;
    stepsEl.innerHTML  = t.stages.map(s =>
      `<span class="learn-step" id="${s.id}">${s.label}</span>`
    ).join('');
    document.getElementById(t.stages[0].id)?.classList.add('active');
  }
}

// ─── LEVEL SCREEN ─────────────────────────

function updateLevelScreen() {
  const isIntervention = activeMenu === 'interventions' && currentIntervention;
  const iconEl  = document.getElementById('level-screen-icon');
  const titleEl = document.getElementById('level-screen-title');
  const subEl   = document.getElementById('level-screen-sub');

  if (isIntervention) {
    iconEl.textContent  = currentIntervention.icon;
    titleEl.textContent = `${currentIntervention.label} — Elige tu nivel`;
    subEl.textContent   = `El agente está esperando — no sabe que esta conversación va a pasar`;
  } else {
    iconEl.textContent  = currentTechnique.icon;
    titleEl.textContent = `${currentTechnique.label} — Elige tu nivel`;
    subEl.textContent   = `Practica la técnica con un escenario real de call center`;
  }
}

// ─── PRACTICE UI ──────────────────────────

function selectLevel(level) {
  currentLevel = level;
  document.querySelectorAll('.level-card').forEach(c => c.classList.remove('selected'));
  const idMap = { novice: 'lvl-novice', mid: 'lvl-mid', adv: 'lvl-adv' };
  document.getElementById(idMap[level]).classList.add('selected');
  document.getElementById('level-next-btn').disabled = false;
}

function configurePracticeUI() {
  const levelLabels  = { novice: 'Novice', mid: 'Practitioner', adv: 'Fieldwork' };
  const contextLabel = activeMenu === 'interventions' && currentIntervention
    ? currentIntervention.label
    : currentTechnique.label;

  document.getElementById('practice-level-pill').textContent = `${contextLabel} · ${levelLabels[currentLevel]}`;
  document.getElementById('box-meter-wrap').style.display = currentLevel === 'adv' ? 'none' : 'flex';

  const hintBtn  = document.getElementById('hint-btn');
  const hintCost = document.getElementById('hint-cost-label');
  if (currentLevel === 'adv') {
    hintBtn.style.display = 'none';
  } else if (currentLevel === 'mid') {
    hintBtn.style.display = '';
    hintCost.textContent  = '(−5 mood)';
  } else {
    hintBtn.style.display = '';
    hintCost.textContent  = '';
  }
  updatePracticeHeader();
}

function updatePracticeHeader() {
  const a      = currentArchetype;
  const av     = document.getElementById('practice-av');
  const nameEl = document.getElementById('practice-avatar-name');
  const modeEl = document.getElementById('carlos-mode-label');
  if (av)     { av.style.background = a.gradient; av.textContent = a.emoji; }
  if (nameEl) nameEl.textContent = a.name;
  if (modeEl) modeEl.textContent = `${a.trait} · ${a.role}`;
}

// ─── MESSAGES ─────────────────────────────

function addMsg(containerId, role, text) {
  const c = document.getElementById(containerId);
  if (!c) return;
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const div  = document.createElement('div');

  if (role === 'agent') {
    div.className = 'msg avatar';
    div.innerHTML = `
      <div class="msg-av-sm">${currentArchetype?.emoji || '👤'}</div>
      <div>
        <div class="bubble">${text}</div>
        <div class="msg-time">${time}</div>
      </div>`;
  } else if (role === 'coach') {
    div.className = 'msg avatar';
    div.innerHTML = `
      <div class="msg-av-sm">🤖</div>
      <div>
        <div class="bubble">${text}</div>
        <div class="msg-time">${time}</div>
      </div>`;
  } else if (role === 'system') {
    div.className = 'msg avatar';
    div.innerHTML = `
      <div>
        <div style="font-size:11px;color:var(--amber);padding:4px 8px;font-style:italic;">${text}</div>
      </div>`;
  } else {
    div.className = 'msg user';
    div.innerHTML = `
      <div>
        <div class="bubble">${text}</div>
        <div class="msg-time">${time}</div>
      </div>
      <div class="msg-av-sm" style="background:var(--blue);">👤</div>`;
  }
  c.appendChild(div);
  c.scrollTop = c.scrollHeight;
}

let typingEl = null;
function showTyping(containerId) {
  const c = document.getElementById(containerId);
  if (!c) return;
  typingEl = document.createElement('div');
  typingEl.className = 'msg avatar';
  typingEl.id = 'typing-el';
  typingEl.innerHTML = `
    <div class="msg-av-sm">🤖</div>
    <div class="typing-dots">
      <div class="dot"></div><div class="dot"></div><div class="dot"></div>
    </div>`;
  c.appendChild(typingEl);
  c.scrollTop = c.scrollHeight;
}

function removeTyping() {
  const el = document.getElementById('typing-el');
  if (el) el.remove();
}

function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (btn) btn.disabled = loading;
}

function handleKey(e, mode) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (mode === 'learn')    sendLearn();
    if (mode === 'work')     sendWork();
    if (mode === 'practice') sendPractice();
  }
}

// ─── MOOD & BOX ───────────────────────────

function updateMood(val) {
  mood = Math.max(0, Math.min(100, val));
  const fill = document.getElementById('mood-fill');
  if (!fill) return;
  fill.style.width      = mood + '%';
  fill.style.background = mood < 35 ? '#ff6b6b' : mood < 60 ? '#f5a623' : '#1ec99a';
  document.getElementById('mood-pct').textContent = mood + '%';
}

function updateBox(state) {
  boxState = state;
  const el = document.getElementById('box-indicator');
  const lb = document.getElementById('box-label');
  if (!el) return;
  const name = currentArchetype?.name?.split(' ')[0] || 'They';
  if (state === 'in') {
    el.textContent = 'In the box';
    el.className   = 'box-indicator in-box';
    if (lb) lb.textContent = `${name} feels like a problem you're solving, not a person you're talking to`;
  } else if (state === 'out') {
    el.textContent = 'Out of the box';
    el.className   = 'box-indicator out-box';
    if (lb) lb.textContent = `${name} feels seen as a person — this is when real listening becomes possible`;
  } else {
    el.textContent = '— —';
    el.className   = 'box-indicator';
    if (lb) lb.textContent = "How you're showing up in this conversation";
  }
}

// ─── VOICE INDICATOR ──────────────────────

const voiceIndicatorStyle = document.createElement('style');
voiceIndicatorStyle.textContent = `
  #voice-indicator.speaking { background: var(--teal) !important; box-shadow: 0 0 6px rgba(30,201,154,.5); }
  #listen-indicator.active  { display: block !important; }
`;
document.head.appendChild(voiceIndicatorStyle);

// ─── WORK SUBMODE ─────────────────────────

function setWorkSubmode(mode) {
  workSubmode = mode;
  document.getElementById('submode-reflect').classList.toggle('active', mode === 'reflect');
  document.getElementById('submode-urgent').classList.toggle('active', mode === 'urgent');
  document.getElementById('work-time-row').style.display = mode === 'urgent' ? 'flex' : 'none';
  document.getElementById('work-mode-label').textContent = mode === 'urgent'
    ? '⚡ Urgent mode · Direct guidance · Action-first'
    : 'Socratic mode · Alex asks, you discover';
  workHistory = [];
  document.getElementById('work-msgs').innerHTML = '';
  directAskCount = 0;
  initWork();
}

function setTime(mins) {
  workTimeLimit = mins;
  document.querySelectorAll('.time-chip').forEach(c => c.classList.remove('active'));
  const id = mins === 0 ? 'tc-open' : `tc-${mins}`;
  document.getElementById(id)?.classList.add('active');
}

// ─── LEARN PROGRESS ───────────────────────

function updateLearnProgress(reply) {
  if (activeMenu === 'interventions') return;
  const t  = currentTechnique;
  const r  = reply.toLowerCase();
  const kw = t.stageKeywords;
  const st = t.stages;
  if (kw[1]?.some(w => r.includes(w))) {
    document.getElementById(st[0]?.id)?.classList.add('done');
    document.getElementById(st[1]?.id)?.classList.add('active');
  }
  if (kw[2]?.some(w => r.includes(w))) {
    document.getElementById(st[1]?.id)?.classList.add('done');
    document.getElementById(st[2]?.id)?.classList.add('active');
  }
  if (kw[3]?.some(w => r.includes(w))) {
    document.getElementById(st[2]?.id)?.classList.add('done');
    document.getElementById(st[3]?.id)?.classList.add('active');
  }
}

// ─── EVAL ─────────────────────────────────

function toggleRecap(btn) {
  const pts = document.getElementById('recap-points');
  pts.classList.toggle('open');
  btn.querySelector('span:last-child').textContent = pts.classList.contains('open') ? '▴' : '▾';
}

// ─── SAVE FOR LATER ───────────────────────

function saveForLater() {
  const label = activeMenu === 'interventions' && currentIntervention
    ? currentIntervention.label
    : currentTechnique.label;
  localStorage.setItem('ldr_saved', label);
  localStorage.setItem('ldr_saved_date', new Date().toLocaleDateString());
  const pivot = document.getElementById('learn-pivot');
  pivot.innerHTML = `
    <div class="pivot-title" style="color:var(--teal);">✓ Saved — ${label}</div>
    <div style="font-size:12px;color:var(--text2);margin-top:4px;">Come back when you're ready to practice.</div>
    <button class="btn-ghost" style="margin-top:10px;width:100%;" onclick="goWelcome()">← Back to menu</button>`;
}

// ─── GLOSSARY ─────────────────────────────

const GLOSSARY = {
  'in the box': {
    title: 'In the box',
    body: 'From "Leadership & Self-Deception" (Arbinger Institute). When you\'re "in the box," you see people as objects — obstacles, tools, or irrelevant. It blocks genuine listening.'
  },
  'out of the box': {
    title: 'Out of the box',
    body: 'You see people as people — with their own struggles and needs. The only state where genuine listening is possible.'
  },
  'self-deception': {
    title: 'Self-Deception',
    body: 'We often lie to ourselves about our intentions. We think we\'re helping, but we\'re managing. Recognizing this is the first step.'
  }
};

function showGloss(term, event) {
  const def = GLOSSARY[term.toLowerCase()];
  if (!def) return;
  const popup = document.getElementById('gloss-popup');
  document.getElementById('gloss-title').textContent = def.title;
  document.getElementById('gloss-body').textContent  = def.body;
  popup.classList.add('visible');
  popup.style.left = Math.min(event.clientX, window.innerWidth - 280) + 'px';
  popup.style.top  = (event.clientY + 12) + 'px';
}

function hideGloss() {
  document.getElementById('gloss-popup').classList.remove('visible');
}

document.addEventListener('click', (e) => {
  if (!e.target.classList.contains('gloss')) hideGloss();
});

// ─── CSS ADDITIONS ────────────────────────

const extraStyle = document.createElement('style');
extraStyle.textContent = `
  .menu-section-label {
    font-size: 10px; font-weight: 600; letter-spacing: .08em;
    text-transform: uppercase; color: var(--text3);
    margin-bottom: 8px; margin-top: 4px;
  }
  .choice-intervention .choice-icon { font-size: 28px; }
  .choice-technique .choice-icon { font-size: 28px; }
  .vr-mode .chat-input { display: none; }
  .vr-mode .send-btn   { display: none; }
  .vr-mode .voice-btn  { flex: 1; padding: 16px; font-size: 28px; }
  #voice-indicator { transition: all .3s; }
  #welcome-user-status {
    font-size: 11px; color: var(--text3);
    margin-top: 2px;
  }
`;
document.head.appendChild(extraStyle);

// ─── PREVIEW ENTRY ────────────────────────

function selectAndPreview(id) {
  if (!setTechnique(id)) return;
  updateModeScreen();
  const pill = document.getElementById('preview-pill');
  if (pill) pill.textContent = currentTechnique.label;
  showTechniquePreview(id);
}

// ─── HISTORY ENTRY ────────────────────────

function goHistory() {
  showHistory();
}
