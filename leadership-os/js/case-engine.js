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

  function pickOpener(archetype, scenario) {
    var openers = archetype.openers || {};
    if (openers[scenario.agentState]) return openers[scenario.agentState];
    var all = Object.keys(openers).map(function (k) { return openers[k]; });
    return all.length ? pick(all) : '...';
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

  return { build: build, interventionKey: interventionKey };
})();
