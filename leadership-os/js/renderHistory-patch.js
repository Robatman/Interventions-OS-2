// ═══════════════════════════════════════════
//  PATCH para preview.js
//  Reemplaza la función renderHistory() existente
//  con esta versión que lee de Supabase.
//  El HTML generado es idéntico — solo cambia la fuente de datos.
// ═══════════════════════════════════════════

async function renderHistory() {
  const el = document.getElementById('history-content');
  if (!el) return;

  // Loading state
  el.innerHTML = `
    <div style="text-align:center;padding:32px;color:var(--text3);font-size:13px;">
      Loading sessions...
    </div>`;

  const sessions = await getSessions(50);

  if (sessions.length === 0) {
    el.innerHTML = `
      <div class="insight-card ic-teal" style="text-align:center;padding:24px;">
        <div style="font-size:32px;margin-bottom:8px;">🌱</div>
        <div class="ic-label">No sessions yet</div>
        <div>Complete your first practice session to start tracking your progress.</div>
      </div>`;
    return;
  }

  const totalSessions = sessions.length;
  const avgMood    = Math.round(sessions.reduce((s, x) => s + (x.mood_final || 0), 0) / totalSessions);
  const outOfBox   = sessions.filter(s => s.box_final === 'out').length;
  const techniques    = [...new Set(sessions.map(s => s.technique).filter(Boolean))];
  const interventions = [...new Set(sessions.map(s => s.intervention).filter(Boolean))];

  el.innerHTML = `
    <div class="history-stats">
      <div class="stat-card"><div class="stat-num">${totalSessions}</div><div class="stat-lbl">Sessions</div></div>
      <div class="stat-card"><div class="stat-num">${avgMood}%</div><div class="stat-lbl">Avg Openness</div></div>
      <div class="stat-card"><div class="stat-num">${outOfBox}</div><div class="stat-lbl">Out of Box</div></div>
      <div class="stat-card"><div class="stat-num">${techniques.length + interventions.length}</div><div class="stat-lbl">Topics</div></div>
    </div>
    <div style="margin:16px 0 8px;"><span class="label-sm">Recent sessions</span></div>
    ${sessions.slice(0, 10).map(s => {
      const date    = s.completed_at
        ? new Date(s.completed_at).toLocaleDateString('en-US', { month:'short', day:'numeric' })
        : '—';
      const context = s.intervention
        ? (INTERVENTIONS[s.intervention]?.label || s.intervention)
        : (TECHNIQUES[s.technique]?.label       || s.technique || '—');
      const levelColors = { novice:'var(--teal)', mid:'var(--amber)', adv:'var(--coral)' };
      const levelColor  = levelColors[s.level] || 'var(--text3)';
      const moodColor   = (s.mood_final||0) < 35 ? 'var(--coral)' : (s.mood_final||0) < 60 ? 'var(--amber)' : 'var(--teal)';
      const agentName   = s.archetype ? (ARCHETYPES[s.archetype]?.name?.split(' ')[0] || s.archetype) : '—';
      return `
        <div class="history-row">
          <div class="history-date">${date}</div>
          <div class="history-main">
            <div class="history-context">${context}</div>
            <div class="history-meta">
              <span style="color:${levelColor};font-size:10px;font-weight:600;text-transform:uppercase;">${s.level||'—'}</span>
              <span style="color:var(--text3);font-size:10px;margin:0 4px;">·</span>
              <span style="font-size:10px;color:var(--text3);">${agentName}</span>
            </div>
            ${s.eval_summary ? `<div class="history-insight">"${s.eval_summary.substring(0,80)}${s.eval_summary.length>80?'...':''}"</div>` : ''}
          </div>
          <div class="history-mood" style="color:${moodColor};">${s.mood_final||0}%</div>
        </div>`;
    }).join('')}
    ${sessions.length > 10 ? `<div style="text-align:center;font-size:11px;color:var(--text3);margin-top:8px;">+ ${sessions.length - 10} more sessions</div>` : ''}`;
}
