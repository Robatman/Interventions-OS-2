// ═══════════════════════════════════════════
//  FIX: Aleatoriedad real en app.js
//  Reemplaza SOLO la función goBriefing()
//  y agrega pickRandomArchetype()
// ═══════════════════════════════════════════

// ─── NUEVA FUNCIÓN — pegar ANTES de goBriefing ────────────
function pickRandomArchetype(excludeId) {
  const available = Object.values(ARCHETYPES).filter(a =>
    a.available && a.id !== excludeId
  );
  if (!available.length) return Object.values(ARCHETYPES).find(a => a.available);
  return available[Math.floor(Math.random() * available.length)];
}

// ─── REEMPLAZA goBriefing() COMPLETA ──────────────────────
function goBriefing() {
  if (!currentLevel) return;

  // ── 1. POOL DE ESCENARIOS ──────────────────────────────
  let pool;
  if (activeMenu === 'interventions' && currentIntervention) {
    pool = getInterventionScenarios(currentLevel);
  } else {
    // Para técnicas: mezclar briefings de TODOS los arquetipos
    // para maximizar variedad
    pool = Object.values(ARCHETYPES)
      .filter(a => a.available)
      .flatMap(a => (a.briefings[currentLevel] || a.briefings['novice'] || []));
  }

  if (!pool || pool.length === 0) {
    alert('No scenarios available for this level yet.');
    return;
  }

  // ── 2. ESCENARIO ALEATORIO ────────────────────────────
  currentScenario = pool[Math.floor(Math.random() * pool.length)];
  currentBriefing = currentScenario;

  // ── 3. ARQUETIPO — lógica de aleatoriedad real ────────
  // Prioridad: si el escenario especifica un agente → usarlo
  // Si no → arquetipo completamente aleatorio
  // Siempre diferente al de la sesión anterior (evitar repetición)
  const lastArchetypeId = window._lastArchetypeId || null;

  if (currentScenario.agentName && ARCHETYPES[currentScenario.agentName]) {
    currentArchetype = ARCHETYPES[currentScenario.agentName];
  } else {
    // Random, evitando repetir el mismo de la sesión anterior
    currentArchetype = pickRandomArchetype(lastArchetypeId);
  }

  // Guardar para la próxima sesión
  window._lastArchetypeId = currentArchetype.id;
  setArchetype(currentArchetype.id);

  // ── 4. UI DEL BRIEFING ────────────────────────────────
  document.getElementById('briefing-text').textContent = currentScenario.text;

  const meta = document.getElementById('briefing-meta');
  if (meta) {
    meta.innerHTML = currentScenario.tags
      .map(t => `<span class="briefing-tag">${t}</span>`)
      .join('');
  }

  // Badge del arquetipo seleccionado (feedback visual)
  const agentBadge = document.getElementById('briefing-agent-badge');
  if (agentBadge) {
    agentBadge.textContent = `${currentArchetype.emoji} ${currentArchetype.name} · ${currentArchetype.trait}`;
    agentBadge.style.display = 'inline-block';
  }

  // Trampa de intervención
  const intentEl = document.getElementById('briefing-intent');
  if (intentEl && activeMenu === 'interventions' && currentIntervention) {
    intentEl.style.display = 'block';
    intentEl.querySelector('.intent-label').textContent = currentIntervention.label;
    intentEl.querySelector('.intent-trap').textContent  = currentIntervention.trap;
  } else if (intentEl) {
    intentEl.style.display = 'none';
  }

  document.getElementById('reflect-assume').value = '';
  show('s-briefing');
}
