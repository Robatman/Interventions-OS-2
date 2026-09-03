// ═══════════════════════════════════════════
//  supabase.js — Leadership OS v5 NO-DB
//  Sin Supabase — funciones vacías
//  No guarda nada, no falla nada
// ═══════════════════════════════════════════

async function saveSession(data) {
  // Sin persistencia — no hace nada
  console.log('[Session] No-DB mode — session not saved');
}

async function getSessions(limit = 50) {
  return [];
}

async function updateTechniqueProgress(techniqueId, moodFinal) {
  // Sin persistencia
}

async function updateArchetypeProgress(archetypeId, level) {
  // Sin persistencia
}
