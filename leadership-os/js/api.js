// ═══════════════════════════════════════════
//  api.js
//  API layer — Interventions OS v5
//  - Groq / Llama 3.3 70B (chat)
//  - Groq PlayAI TTS (voice per archetype)
//  - Supabase (anonymous session progress)
// ═══════════════════════════════════════════

// ─── GROQ CHAT ────────────────────────────

async function callGroq(messages, systemPrompt, temp = 0.82) {
  if (!GROQ_KEY) throw new Error('No API key');
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
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
// Voice assigned per archetype — real distinct voices
// Groq PlayAI voices: https://console.groq.com/docs/speech-text
const ARCHETYPE_VOICES = {
  carlos:  'Fritz-PlayAI',      // male, direct
  valeria: 'Celeste-PlayAI',    // female, measured
  miguel:  'Chip-PlayAI',       // male, younger energy
  sandra:  'Deedee-PlayAI',     // female, experienced
  default: 'Fritz-PlayAI'
};

// Alex (coach) voice
const COACH_VOICE = 'Aaliyah-PlayAI';

let currentAudio = null;
let isSpeaking = false;

async function speakWithGroq(text, archetypeId = 'default') {
  if (!GROQ_KEY) return;

  // Clean text — remove stage directions and metadata tags
  const clean = text
    .replace(/\[.*?\]/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/\*.*?\*/g, '')
    .trim();

  if (!clean) return;

  // Stop any current speech
  stopSpeaking();

  const voice = archetypeId === 'coach'
    ? COACH_VOICE
    : (ARCHETYPE_VOICES[archetypeId] || ARCHETYPE_VOICES.default);

  try {
    isSpeaking = true;
    updateVoiceIndicator(true);

    const res = await fetch('https://api.groq.com/openai/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_KEY}`
      },
      body: JSON.stringify({
        model: 'playai-tts',
        input: clean,
        voice: voice,
        response_format: 'wav'
      })
    });

    if (!res.ok) {
      // Fallback to browser TTS if Groq TTS fails
      console.warn('[TTS] Groq TTS failed, falling back to browser');
      speakBrowser(clean);
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    currentAudio = new Audio(url);

    currentAudio.onended = () => {
      isSpeaking = false;
      updateVoiceIndicator(false);
      URL.revokeObjectURL(url);
      // Auto-activate mic after agent speaks (VR mode)
      if (vrMode) setTimeout(() => startListening(), 400);
    };

    currentAudio.onerror = () => {
      isSpeaking = false;
      updateVoiceIndicator(false);
      speakBrowser(clean); // fallback
    };

    await currentAudio.play();

  } catch (e) {
    console.warn('[TTS] Error:', e.message);
    isSpeaking = false;
    updateVoiceIndicator(false);
    speakBrowser(clean); // fallback
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

// Browser TTS fallback
function speakBrowser(text) {
  if (!('speechSynthesis' in window)) return;
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'en-US';
  utt.rate = 0.92;
  utt.pitch = 1.0;
  utt.onend = () => {
    isSpeaking = false;
    updateVoiceIndicator(false);
    if (vrMode) setTimeout(() => startListening(), 400);
  };
  speechSynthesis.speak(utt);
}

function updateVoiceIndicator(speaking) {
  const indicator = document.getElementById('voice-indicator');
  if (indicator) {
    indicator.classList.toggle('speaking', speaking);
  }
}

// ─── SPEECH TO TEXT ───────────────────────
// Continuous voice input — no Send button needed in VR

let recognition = null;
let isListening = false;
let vrMode = false;

function setVRMode(enabled) {
  vrMode = enabled;
  document.body.classList.toggle('vr-mode', enabled);
}

function startListening() {
  if (isSpeaking) return; // Don't listen while agent is speaking
  if (isListening) return;
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.continuous = false;

  const btn = document.getElementById('practice-voice') || document.getElementById('work-voice') || document.getElementById('learn-voice');

  recognition.onstart = () => {
    isListening = true;
    if (btn) { btn.classList.add('listening'); btn.textContent = '🔴'; }
    updateListenIndicator(true);
  };

  recognition.onresult = (e) => {
    const txt = e.results[0][0].transcript;
    // Route to the active mode
    if (activeMode === 'practice') handleVoiceInput(txt, 'practice');
    else if (activeMode === 'work')  handleVoiceInput(txt, 'work');
    else if (activeMode === 'learn') handleVoiceInput(txt, 'learn');
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
  // Auto-send
  if (mode === 'practice') sendPractice();
  else if (mode === 'work') sendWork();
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
  document.getElementById('key-dot').className = 'status-dot sd-on';
  document.getElementById('key-msg').innerHTML = '<span style="color:var(--teal)">✓ Connected — Groq ready</span>';
  document.getElementById('enter-btn').disabled = false;
}

window.addEventListener('DOMContentLoaded', () => {
  if (GROQ_KEY) {
    document.getElementById('groq-input').value = GROQ_KEY;
    document.getElementById('key-dot').className = 'status-dot sd-on';
    document.getElementById('key-msg').innerHTML = '<span style="color:var(--teal)">✓ Key loaded from last session</span>';
    document.getElementById('enter-btn').disabled = false;
  }
  console.log('[Interventions OS] Session:', getSessionId());
});

// ─── SUPABASE ─────────────────────────────

const SUPABASE_URL = '';
const SUPABASE_ANON_KEY = '';

function getSessionId() {
  let id = localStorage.getItem('ldr_session_id');
  if (!id) {
    id = 'anon_' + crypto.randomUUID();
    localStorage.setItem('ldr_session_id', id);
  }
  return id;
}

async function saveSessionProgress(data) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    const key = `ldr_session_${Date.now()}`;
    localStorage.setItem(key, JSON.stringify({ ...data, completedAt: Date.now() }));
    return { ok: true, local: true };
  }
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        session_id: getSessionId(),
        intervention: data.intervention || null,
        archetype: data.archetype,
        technique: data.technique,
        level: data.level,
        mood_final: data.moodFinal,
        box_final: data.boxFinal,
        completed_at: new Date().toISOString(),
        eval_summary: data.evalSummary || null
      })
    });
    return { ok: res.ok };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
