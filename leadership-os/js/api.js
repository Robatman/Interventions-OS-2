// ═══════════════════════════════════════════
//  api.js
//  API layer — Interventions OS v5
//  - Groq via proxy /api/groq (key segura en Vercel)
//  - Groq PlayAI TTS (voice per archetype)
// ═══════════════════════════════════════════

// ─── GROQ CHAT ────────────────────────────

async function callGroq(messages, systemPrompt, temp = 0.82) {
  const res = await fetch('/api/groq', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'playai-tts-v2',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      temperature: temp,
      max_tokens: 300
    })
  });
  const d = await res.json();
  if (d.error) throw new Error(d.error.message);
  return d.choices?.[0]?.message?.content || '...';
}

// ─── GROQ TTS ─────────────────────────────

const ARCHETYPE_VOICES = {
  carlos:  'Fritz-PlayAI',
  valeria: 'Celeste-PlayAI',
  miguel:  'Chip-PlayAI',
  sandra:  'Deedee-PlayAI',
  default: 'Fritz-PlayAI'
};

const COACH_VOICE = 'Aaliyah-PlayAI';

let currentAudio = null;
let isSpeaking   = false;

async function speakWithGroq(text, archetypeId = 'default') {
  if (!GROQ_KEY) return;

  const clean = text
    .replace(/\[.*?\]/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/\*.*?\*/g, '')
    .trim();

  if (!clean) return;

  stopSpeaking();

  const voice = archetypeId === 'coach'
    ? COACH_VOICE
    : (ARCHETYPE_VOICES[archetypeId] || ARCHETYPE_VOICES.default);

  try {
    isSpeaking = true;
    updateVoiceIndicator(true);

    const res = await fetch('/api/groq-tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'playai-tts',
        input: clean,
        voice: voice,
        response_format: 'wav'
      })
    });

    if (!res.ok) {
      console.warn('[TTS] Groq TTS failed, falling back to browser');
      speakBrowser(clean);
      return;
    }

    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    currentAudio = new Audio(url);

    currentAudio.onended = () => {
      isSpeaking = false;
      updateVoiceIndicator(false);
      URL.revokeObjectURL(url);
      if (vrMode) setTimeout(() => startListening(), 400);
    };

    currentAudio.onerror = () => {
      isSpeaking = false;
      updateVoiceIndicator(false);
      speakBrowser(clean);
    };

    await currentAudio.play();

  } catch (e) {
    console.warn('[TTS] Error:', e.message);
    isSpeaking = false;
    updateVoiceIndicator(false);
    speakBrowser(clean);
  }
}

function stopSpeaking() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  isSpeaking = false;
  updateVoiceIndicator(false);
}

function speakBrowser(text) {
  if (!('speechSynthesis' in window)) return;
  const utt   = new SpeechSynthesisUtterance(text);
  utt.lang    = 'en-US';
  utt.rate    = 0.92;
  utt.pitch   = 1.0;
  utt.onend   = () => {
    isSpeaking = false;
    updateVoiceIndicator(false);
    if (vrMode) setTimeout(() => startListening(), 400);
  };
  speechSynthesis.speak(utt);
}

function updateVoiceIndicator(speaking) {
  const indicator = document.getElementById('voice-indicator');
  if (indicator) indicator.classList.toggle('speaking', speaking);
}

// ─── SPEECH TO TEXT ───────────────────────

let recognition = null;
let isListening = false;
let vrMode      = false;

function setVRMode(enabled) {
  vrMode = enabled;
  document.body.classList.toggle('vr-mode', enabled);
}

function startListening() {
  if (isSpeaking)  return;
  if (isListening) return;
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;

  const SR  = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR();
  recognition.lang            = 'en-US';
  recognition.interimResults  = false;
  recognition.continuous      = false;

  const btn = document.getElementById('practice-voice')
    || document.getElementById('work-voice')
    || document.getElementById('learn-voice');

  recognition.onstart = () => {
    isListening = true;
    if (btn) { btn.classList.add('listening'); btn.textContent = '🔴'; }
    updateListenIndicator(true);
  };

  recognition.onresult = (e) => {
    const txt = e.results[0][0].transcript;
    if      (activeMode === 'practice') handleVoiceInput(txt, 'practice');
    else if (activeMode === 'work')     handleVoiceInput(txt, 'work');
    else if (activeMode === 'learn')    handleVoiceInput(txt, 'learn');
  };

  recognition.onend = () => {
    isListening = false;
    if (btn) { btn.classList.remove('listening'); btn.textContent = '🎤'; }
    updateListenIndicator(false);
  };

  recognition.onerror = () => {
    isListening = false;
    if (btn) { btn.classList.remove('listening'); btn.textContent = '🎤'; }
    updateListenIndicator(false);
  };

  recognition.start();
}

function stopListening() {
  if (recognition) recognition.stop();
  isListening = false;
  updateListenIndicator(false);
}

function toggleVoice(mode) {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Voice not supported in this browser. Works on Chrome and Quest 3.');
    return;
  }
  if (isListening) { stopListening(); return; }
  startListening();
}

function handleVoiceInput(text, mode) {
  const inputEl = document.getElementById(`${mode}-input`);
  if (inputEl) inputEl.value = text;
  if (mode === 'practice') sendPractice();
  else if (mode === 'work')  sendWork();
  else if (mode === 'learn') sendLearn();
}

function updateListenIndicator(listening) {
  const indicator = document.getElementById('listen-indicator');
  if (indicator) indicator.classList.toggle('active', listening);
}

// ─── GROQ KEY MANAGEMENT ──────────────────

function saveKey() {
  GROQ_KEY = document.getElementById('groq-input').value.trim();
  if (!GROQ_KEY) return;
  localStorage.setItem('groq_key', GROQ_KEY);
  document.getElementById('key-dot').className    = 'status-dot sd-on';
  document.getElementById('key-msg').innerHTML    = '<span style="color:var(--teal)">✓ Connected — Groq ready</span>';
  document.getElementById('enter-btn').disabled   = false;
}

window.addEventListener('DOMContentLoaded', () => {
  if (GROQ_KEY) {
    document.getElementById('groq-input').value   = GROQ_KEY;
    document.getElementById('key-dot').className  = 'status-dot sd-on';
    document.getElementById('key-msg').innerHTML  = '<span style="color:var(--teal)">✓ Key loaded from last session</span>';
    document.getElementById('enter-btn').disabled = false;
  }
  console.log('[Interventions OS] Session:', getUserId());
});

// ─── SESSION PERSISTENCE ──────────────────
// saveSessionProgress está en app.js
// getSessions y saveSession están en supabase.js
