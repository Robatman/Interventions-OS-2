// ═══════════════════════════════════════════
//  supabase.js — Leadership OS
//  Constantes y persistencia de sesiones.
//  NOTA: getUserId() viene de auth.js que carga primero.
// ═══════════════════════════════════════════

const SUPABASE_URL     = 'https://biebfwwkukmxulzwpjya.supabase.co';
const SUPABASE_KEY     = 'sb_publishable_X13ybEk5Wl0a3e-XHhM5ew_IQcDk3wu';
const SUPABASE_HEADERS = {
  'Content-Type':  'application/json',
  'apikey':        SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`
};

// ─── SAVE SESSION ─────────────────────────

async function saveSession(data) {
  const payload = {
    user_id:      getUserId(),
    technique:    data.technique    || null,
    intervention: data.intervention || null,
    archetype:    data.archetype    || null,
    level:        data.level        || null,
    mood_final:   data.moodFinal    ?? null,
    box_final:    data.boxFinal     || null,
    eval_summary: data.evalSummary  || null,
    completed_at: new Date().toISOString()
  };

  try {
    const token = getSessionToken();
    const headers = token
      ? { ...SUPABASE_HEADERS, 'Authorization': `Bearer ${token}` }
      : SUPABASE_HEADERS;

    const res = await fetch(`${SUPABASE_URL}/rest/v1/sessions`, {
      method:  'POST',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body:    JSON.stringify(payload)
    });
    if (!res.ok) console.error('saveSession error:', await res.text());
  } catch (e) {
    console.error('saveSession fetch failed:', e);
  }

  if (data.technique) updateTechniqueProgress(data.technique, data.moodFinal);
  if (data.archetype) updateArchetypeProgress(data.archetype, data.level);
}

// ─── GET SESSIONS ─────────────────────────

async function getSessions(limit = 50) {
  try {
    const token = getSessionToken();
    const headers = token
      ? { ...SUPABASE_HEADERS, 'Authorization': `Bearer ${token}` }
      : SUPABASE_HEADERS;

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/sessions?user_id=eq.${getUserId()}&order=completed_at.desc&limit=${limit}`,
      { headers }
    );
    if (!res.ok) { console.error('getSessions error:', await res.text()); return []; }
    return await res.json();
  } catch (e) {
    console.error('getSessions fetch failed:', e);
    return [];
  }
}

// ─── UPDATE TECHNIQUE PROGRESS ────────────

async function updateTechniqueProgress(techniqueId, moodFinal) {
  const uid = getUserId();
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/technique_progress?user_id=eq.${uid}&technique_id=eq.${techniqueId}`,
      { headers: SUPABASE_HEADERS }
    );
    const rows = await res.json();
    const existing = rows[0];

    const payload = existing ? {
      times_practiced: (existing.times_practiced || 0) + 1,
      best_mood:       Math.max(existing.best_mood || 0, moodFinal || 0),
      last_used:       new Date().toISOString()
    } : {
      user_id:         uid,
      technique_id:    techniqueId,
      times_practiced: 1,
      best_mood:       moodFinal || 0,
      last_used:       new Date().toISOString()
    };

    const method = existing ? 'PATCH' : 'POST';
    const url    = existing
      ? `${SUPABASE_URL}/rest/v1/technique_progress?user_id=eq.${uid}&technique_id=eq.${techniqueId}`
      : `${SUPABASE_URL}/rest/v1/technique_progress`;

    await fetch(url, {
      method,
      headers: { ...SUPABASE_HEADERS, 'Prefer': 'return=minimal' },
      body:    JSON.stringify(payload)
    });
  } catch (e) {
    console.error('updateTechniqueProgress failed:', e);
  }
}

// ─── UPDATE ARCHETYPE PROGRESS ────────────

async function updateArchetypeProgress(archetypeId, level) {
  const uid = getUserId();
  const levelOrder = { novice: 1, mid: 2, adv: 3 };

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/archetype_progress?user_id=eq.${uid}&archetype_id=eq.${archetypeId}`,
      { headers: SUPABASE_HEADERS }
    );
    const rows = await res.json();
    const existing = rows[0];

    const currentRank  = levelOrder[level] || 0;
    const existingRank = levelOrder[existing?.highest_level] || 0;

    const payload = existing ? {
      sessions_count: (existing.sessions_count || 0) + 1,
      highest_level:  currentRank > existingRank ? level : existing.highest_level,
      last_used:      new Date().toISOString()
    } : {
      user_id:        uid,
      archetype_id:   archetypeId,
      sessions_count: 1,
      highest_level:  level || null,
      last_used:      new Date().toISOString()
    };

    const method = existing ? 'PATCH' : 'POST';
    const url    = existing
      ? `${SUPABASE_URL}/rest/v1/archetype_progress?user_id=eq.${uid}&archetype_id=eq.${archetypeId}`
      : `${SUPABASE_URL}/rest/v1/archetype_progress`;

    await fetch(url, {
      method,
      headers: { ...SUPABASE_HEADERS, 'Prefer': 'return=minimal' },
      body:    JSON.stringify(payload)
    });
  } catch (e) {
    console.error('updateArchetypeProgress failed:', e);
  }
}
