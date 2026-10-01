// ═══════════════════════════════════════════
//  case-engine.js — un solo "caso" por práctica
//
//  Problema que resuelve: el briefing, la práctica y el avatar sorteaban
//  por separado (el briefing mostraba a uno y la práctica ponía a otro).
//  Ahora el caso se crea UNA vez y todos leen de ahí.
//
//  Depende de (globales): ARCHETYPES, INTERVENTIONS
// ═══════════════════════════════════════════

const CaseEngine = (function () {

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function availableArchetypes() {
    return Object.keys(ARCHETYPES)
      .filter(function (id) { return ARCHETYPES[id].available !== false; })
      .map(function (id) { return ARCHETYPES[id]; });
  }

  // 'interv_pulse_check' / 'pulse-check' / 'pulse_check' → 'pulse_check' (o null si no existe)
  function interventionKey(raw) {
    if (!raw || typeof INTERVENTIONS === 'undefined') return null;
    var key = String(raw).replace(/^interv[_-]/, '').replace(/-/g, '_');
    return INTERVENTIONS[key] ? key : null;
  }

  // El nivel 'mid' a veces se llama 'intermediate'
  function levelPool(map, level) {
    if (!map) return [];
    return map[level] || map[level === 'mid' ? 'intermediate' : level] || map.novice || [];
  }

  // Unifica los campos que usan los escenarios de archetypes.js (carlosState) y de interventions.js (agentState)
  function normalizeScenario(raw, extra) {
    var s = Object.assign({}, raw, extra || {});
    s.agentState = s.agentState || s.carlosState || 'guarded-tired';
    s.agentHiddenState = s.agentHiddenState || '';
    s.startMood = typeof s.startMood === 'number' ? s.startMood : 30;
    s.tags = s.tags || [];
    return s;
  }

  // ─── Antigüedad coherente con la intervención (30 / 100 / 121 / 365 días) ───
  function tenureLabel(day) {
    return day >= 365 ? 'Year 1' : 'Day ' + day;
  }

  function withTenure(archetype, intervention) {
    var base = String(archetype.role || 'Call Center Agent').split('·')[0].trim();
    // Los roles "Senior"/"Team Lead" no encajan con alguien de 30-365 días
    if (/senior|lead/i.test(base)) base = 'Call Center Agent';
    return Object.assign({}, archetype, { role: base + ' · ' + tenureLabel(intervention.day) });
  }

  function tenureNote(intervention) {
    var d = intervention.day;
    var span = d >= 365 ? 'about one year' : 'about ' + d + ' days';
    return 'You have been at this company for ' + span + '. This overrides any other length of time mentioned elsewhere. ' +
      'Never say you have been here longer or shorter than that. Your history at THIS company is limited to that time; ' +
      'any older experience comes from previous jobs.';
  }

  // ─── Aleatoriedad: que nadie sepa de antemano cómo va a estar el ánimo ───
  var REACTIONS = [
    { id: 'cries_if_minimized',     text: 'If the supervisor minimizes or reassures too fast ("it will be fine", "don\'t worry", "everyone goes through this"), you get emotional: your voice breaks, you may tear up, even if you were calm before.' },
    { id: 'flares_if_pressured',    text: 'If you feel pressured, compared to other people, or the supervisor goes metrics-first, you flare up (sharp tone), and then you regret it a little.' },
    { id: 'softens_if_specific',    text: 'If the supervisor recalls a SPECIFIC and true thing you did well, you visibly relax and share something real you were holding back.' },
    { id: 'deflects_with_humor',    text: 'When the conversation gets close to something real, you joke to deflect. If the supervisor gently notices the joke, you drop it and get serious.' },
    { id: 'goes_flat_if_advice',    text: 'Unsolicited advice makes you go flat: very short answers, "sure", "okay", "I guess".' },
    { id: 'surprised_by_gratitude', text: 'If you are thanked sincerely, you are surprised and a bit awkward: you may laugh nervously or get teary.' },
    { id: 'opens_if_silence',       text: 'If the supervisor lets a silence breathe without rushing to fill it, you end up saying the real thing on your own.' },
    { id: 'tests_sincerity',        text: 'You quietly test whether the supervisor is sincere. A generic or scripted question makes you answer generically too.' }
  ];

  var TWISTS = [
    'Something outside work happened this week that is weighing on you. You only mention it if you feel genuinely safe and asked well.',
    'You recently got a message from another company (or a friend) about a different job. You do not volunteer it.',
    'You actually have a concrete idea or request (schedule, a skill, a role) but you were not sure anyone wanted to hear it.',
    'You had a small conflict with a teammate that is bothering you more than you admit.',
    'Today you are in a noticeably better mood than the situation suggests, and you do not understand why people are worried.'
  ];

  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

  function applyRandomness(scenario, level) {
    // Ánimo inicial: variación amplia según nivel, con 1 de cada 6 casos "al revés"
    var spread = { novice: 12, mid: 18, adv: 22 }[level] || 15;
    var delta = Math.round((Math.random() * 2 - 1) * spread);
    if (Math.random() < 1 / 6) delta = (Math.random() < 0.5 ? -1 : 1) * (30 + Math.round(Math.random() * 10));
    scenario.baseMood = scenario.startMood;
    scenario.startMood = clamp(scenario.startMood + delta, 8, 85);

    scenario.reactions = shuffle(REACTIONS).slice(0, 2);
    scenario.humor = Math.random() < 0.3;
    scenario.twist = Math.random() < 0.35 ? pick(TWISTS) : null;
    return scenario;
  }

  // Saludos neutrales según el ánimo inicial: se usan cuando el personaje no tiene un saludo
  // para el estado del escenario (antes se elegía uno al azar, que podía no encajar).
  var GENERIC_OPENERS = {
    low:  ["...Yeah? You wanted to see me?", "(sits down) Okay. What's this about?", "...Hey. Is this going to take long?"],
    mid:  ["Hey. Sure, what's up?", "Hi. You wanted to talk to me?", "Hey, yeah. Do you want me to sit here?"],
    high: ["Hi! Yes, sure. How's it going?", "Hey! Good to see you. What's up?", "Hi! Of course, come in. What's going on?"]
  };

  function pickOpener(archetype, scenario) {
    var openers = archetype.openers || {};
    if (openers[scenario.agentState]) return openers[scenario.agentState];
    var bucket = scenario.startMood < 30 ? 'low' : (scenario.startMood < 55 ? 'mid' : 'high');
    return pick(GENERIC_OPENERS[bucket]);
  }

  /**
   * @param {{interventionId?: string, techniqueId?: string, level?: string}} opts
   *   interventionId: 'interv_pulse_check' | 'pulse_check' | ...  (modo intervención)
   *   techniqueId:    'active_listening' | ...                    (modo técnica)
   * @returns {object|null} caso
   */
  function build(opts) {
    opts = opts || {};
    var level = opts.level || 'novice';
    var interventionId = interventionKey(opts.interventionId);
    var archetypes = availableArchetypes();
    if (!archetypes.length) return null;

    var intervention = interventionId ? INTERVENTIONS[interventionId] : null;
    var archetype, scenario;

    if (intervention) {
      // Modo intervención: el escenario manda y define quién es el agente.
      var pool = levelPool(intervention.scenarios, level);
      // Un escenario que nombra a alguien sin arquetipo (p. ej. 'karen') no se puede jugar con coherencia:
      // se omite mientras haya otros disponibles.
      var playable = pool.filter(function (s) {
        return !s.agentName || (ARCHETYPES[s.agentName] && ARCHETYPES[s.agentName].available !== false);
      });
      if (playable.length) pool = playable;
      var raw = pool.length ? pick(pool) : { text: intervention.agentContext || intervention.objective || '' };
      archetype = (raw.agentName && ARCHETYPES[raw.agentName] && ARCHETYPES[raw.agentName].available !== false)
        ? ARCHETYPES[raw.agentName]
        : pick(archetypes);
      scenario = normalizeScenario(raw);
      // La antigüedad la define la intervención (día 30/100/121/365), no el personaje
      scenario.tenureDays = intervention.day;
      scenario.tenureNote = tenureNote(intervention);
      archetype = withTenure(archetype, intervention);
    } else {
      // Modo técnica: se elige el agente y luego uno de SUS escenarios para ese nivel.
      archetype = pick(archetypes);
      var list = levelPool(archetype.briefings, level);
      if (opts.techniqueId) {
        var byTechnique = list.filter(function (b) { return b.tecnica === opts.techniqueId; });
        if (byTechnique.length) list = byTechnique;
      }
      scenario = normalizeScenario(list.length ? pick(list) : { text: archetype.backstory || '' });
    }

    applyRandomness(scenario, level);

    return {
      mode: intervention ? 'intervention' : 'technique',
      level: level,
      interventionId: interventionId,
      intervention: intervention,
      techniqueId: opts.techniqueId || null,
      archetype: archetype,
      scenario: scenario,
      opener: pickOpener(archetype, scenario),
      used: false,          // la práctica lo marca al consumirlo
      createdAt: Date.now()
    };
  }

  // ─── Tono del staff: detector sencillo (inglés y español) ───
  // Sirve para que el agente reaccione como una persona real a la falta de respeto,
  // aunque el modelo se quede corto: se le avisa del tono y se garantiza que el ánimo baje.
  var HOSTILE = [
    /\b(shut up|stupid|idiot|useless|incompetent|pathetic|loser|lazy|worthless)\b/,
    /\b(i do not care|i don'?t care|don'?t care|no one cares|nobody cares)\b/,
    /\b(not my problem|your problem|that'?s on you|your fault|deal with it|get over it|suck it up)\b/,
    /\b(stop (complaining|whining|crying|making excuses))\b/,
    /\b(you'?re fired|or you'?re fired|i('| wi)ll write you up|write you up|i('| wi)ll fire you)\b/,
    /\b(yes or yes|whatever)\b/,
    /\bperiod\.?\s*$/,
    /(c[aá]llate|no me importa|es tu problema|no es mi problema|sup[eé]ralo|a m[ií] qu[eé]|tu culpa|in[uú]til|est[uú]pid|te voy a correr|o te corro|lo que sea|deja de (quejarte|llorar))/
  ];
  var DISMISSIVE = [
    /\b(you (have|need|must|got) to be here|you should have|that'?s not (a|an) (excuse|reason)|excuses|everyone has (problems|issues)|man up)\b/,
    /\b(just|simply) (focus|do your job|be on time|work harder|deal)\b/,
    /\b(i (already )?told you|how many times)\b/,
    /(no es excusa|todos tenemos problemas|solo (enf[oó]cate|haz tu trabajo)|ya te dije)/
  ];
  var WARM = [
    /\b(i appreciate|thank you for|thanks for sharing|tell me more|how are you (feeling|doing)|i'?m sorry|that sounds (hard|tough|difficult)|help me understand|what would help|i hear you)\b/,
    /(gracias por|cu[eé]ntame|c[oó]mo te sientes|lo siento|suena (dif[ií]cil|duro)|ay[uú]dame a entender)/
  ];
  function tone(text) {
    var t = ' ' + String(text || '').toLowerCase().replace(/\s+/g, ' ').trim() + ' ';
    var any = function (list) { return list.some(function (re) { return re.test(t); }); };
    if (any(HOSTILE)) return 'hostile';
    if (any(DISMISSIVE)) return 'dismissive';
    if (any(WARM)) return 'warm';
    return 'neutral';
  }
  // Nota que se añade al prompt de ESTE turno
  function toneHint(t) {
    if (t === 'hostile') return 'SUPERVISOR TONE THIS TURN: HOSTILE / DISRESPECTFUL. Your reply MUST show a strong, believable reaction in line with your personality (hurt, anger, shutting down, tears). Do NOT be calm, polite or reassuring, and do NOT say you understand. Your mood must drop at least 18 points. Keep it short.';
    if (t === 'dismissive') return 'SUPERVISOR TONE THIS TURN: DISMISSIVE. Show visible cooling or defensiveness in line with your personality. Do NOT warmly agree. Your mood must drop at least 8 points.';
    if (t === 'warm') return 'SUPERVISOR TONE THIS TURN: WARM. You may soften slightly, but only as much as feels earned by what they actually said.';
    return '';
  }
  // El ánimo nunca debe subir (ni bajar poco) justo después de una falta de respeto
  function enforceMood(t, prev, proposed) {
    var m = Number(proposed);
    if (isNaN(m)) m = prev;
    if (t === 'hostile') m = Math.min(m, prev - 18);
    else if (t === 'dismissive') m = Math.min(m, prev - 8);
    return Math.max(0, Math.min(100, Math.round(m)));
  }

  return { build: build, interventionKey: interventionKey, tone: tone, toneHint: toneHint, enforceMood: enforceMood };
})();
