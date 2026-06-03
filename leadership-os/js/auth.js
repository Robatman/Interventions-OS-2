// ═══════════════════════════════════════════
//  auth.js — Leadership OS
//  Game ID authentication via Supabase Auth
//  Carga ANTES de supabase.js — define getUserId()
//  Roles: A=Admin, R=Reclutamiento, C=Coach,
//         Q=QA, T=Trainer, M=Manager, H=HR
// ═══════════════════════════════════════════

const ROLE_MAP = {
  A: 'Admin',
  R: 'Reclutamiento',
  C: 'Coach',
  Q: 'QA',
  T: 'Trainer',
  M: 'Manager',
  H: 'HR'
};

// ─── GAME ID VALIDATION ───────────────────

function validateGameId(gameId) {
  if (!gameId || typeof gameId !== 'string') return false;
  const upper = gameId.toUpperCase().trim();
  const pattern = /^[ARCQTMH][A-Z]\.[A-Z]{2,}$/;
  return pattern.test(upper);
}

function parseGameId(gameId) {
  const upper = gameId.toUpperCase().trim();
  return {
    roleCode:    upper[0],
    roleName:    ROLE_MAP[upper[0]] || 'Unknown',
    nameInitial: upper[1],
    lastName:    upper.split('.')[1],
    isAdmin:     upper[0] === 'A'
  };
}

function formatGameId(raw) {
  let v = raw.toUpperCase().replace(/[^A-Z.]/g, '');
  if (v.length >= 3 && v[2] !== '.') {
    v = v.slice(0, 2) + '.' + v.slice(2);
  }
  return v;
}

// ─── SUPABASE AUTH ────────────────────────

const FAKE_DOMAIN = '@leadershipos.app';

function gameIdToEmail(gameId) {
  return gameId.toUpperCase().trim() + FAKE_DOMAIN;
}

// ─── SESSION TOKEN ────────────────────────

function getSessionToken() {
  try { return localStorage.getItem('ldr_session_token') || ''; }
  catch (e) { return ''; }
}

function setSessionToken(token) {
  try { localStorage.setItem('ldr_session_token', token); }
  catch (e) {}
}

function clearSessionToken() {
  try {
    localStorage.removeItem('ldr_session_token');
    localStorage.removeItem('ldr_refresh_token');
  } catch (e) {}
}

// ─── CURRENT USER ─────────────────────────

let currentUser    = null;
let currentProfile = null;

// ─── GET USER ID ──────────────────────────
// Esta función es usada por supabase.js — debe estar aquí.

function getUserId() {
  if (currentUser?.id) return currentUser.id;
  let uid = localStorage.getItem('ldr_uid');
  if (!uid) {
    uid = 'anon_' + Math.random().toString(36).slice(2, 11);
    localStorage.setItem('ldr_uid', uid);
  }
  return uid;
}

// ─── REGISTER ─────────────────────────────

async function registerUser(gameId, password) {
  // Bloquear registro con rol A
  if (gameId.toUpperCase()[0] === 'A') {
    throw new Error('El rol Admin no está disponible para registro.');
  }

  const email  = gameIdToEmail(gameId);
  const parsed = parseGameId(gameId);

  const supaUrl = 'https://biebfwwkukmxulzwpjya.supabase.co';
  const supaKey = 'sb_publishable_X13ybEk5Wl0a3e-XHhM5ew_IQcDk3wu';

  const res = await fetch(`${supaUrl}/auth/v1/signup`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': supaKey },
    body:    JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || data.msg || 'Registration failed');
  }

  const userId = data.user?.id;
  const token  = data.access_token;
  if (!userId) throw new Error('No user ID returned');

  await fetch(`${supaUrl}/rest/v1/user_profiles`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'apikey':         supaKey,
      'Authorization': `Bearer ${token}`,
      'Prefer':        'return=minimal'
    },
    body: JSON.stringify({
      id:           userId,
      game_id:      gameId.toUpperCase().trim(),
      role_code:    parsed.roleCode,
      display_name: `${parsed.nameInitial}. ${parsed.lastName}`
    })
  });

  setSessionToken(token);
  if (data.refresh_token) localStorage.setItem('ldr_refresh_token', data.refresh_token);

  currentUser    = data.user;
  currentProfile = {
    game_id:      gameId.toUpperCase(),
    role_code:    parsed.roleCode,
    display_name: `${parsed.nameInitial}. ${parsed.lastName}`
  };

  return { user: data.user, profile: currentProfile };
}

// ─── LOGIN ────────────────────────────────

async function loginUser(gameId, password) {
  const email   = gameIdToEmail(gameId);
  const supaUrl = 'https://biebfwwkukmxulzwpjya.supabase.co';
  const supaKey = 'sb_publishable_X13ybEk5Wl0a3e-XHhM5ew_IQcDk3wu';

  const res = await fetch(`${supaUrl}/auth/v1/token?grant_type=password`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': supaKey },
    body:    JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error_description || data.error || 'Login failed');
  }

  setSessionToken(data.access_token);
  if (data.refresh_token) localStorage.setItem('ldr_refresh_token', data.refresh_token);

  currentUser = data.user;
  await loadProfile(data.access_token);

  return { user: data.user, profile: currentProfile };
}

// ─── LOAD PROFILE ─────────────────────────

async function loadProfile(token) {
  const supaUrl = 'https://biebfwwkukmxulzwpjya.supabase.co';
  const supaKey = 'sb_publishable_X13ybEk5Wl0a3e-XHhM5ew_IQcDk3wu';
  try {
    const t   = token || getSessionToken();
    const res = await fetch(
      `${supaUrl}/rest/v1/user_profiles?select=*&limit=1`,
      { headers: { 'apikey': supaKey, 'Authorization': `Bearer ${t}` } }
    );
    const rows     = await res.json();
    currentProfile = rows[0] || null;
  } catch (e) {
    currentProfile = null;
  }
}

// ─── LOGOUT ───────────────────────────────

async function logoutUser() {
  const supaUrl = 'https://biebfwwkukmxulzwpjya.supabase.co';
  const supaKey = 'sb_publishable_X13ybEk5Wl0a3e-XHhM5ew_IQcDk3wu';
  try {
    await fetch(`${supaUrl}/auth/v1/logout`, {
      method:  'POST',
      headers: { 'apikey': supaKey, 'Authorization': `Bearer ${getSessionToken()}` }
    });
  } catch (e) {}
  clearSessionToken();
  currentUser    = null;
  currentProfile = null;
}

// ─── REFRESH TOKEN ────────────────────────

async function refreshSession() {
  const supaUrl      = 'https://biebfwwkukmxulzwpjya.supabase.co';
  const supaKey      = 'sb_publishable_X13ybEk5Wl0a3e-XHhM5ew_IQcDk3wu';
  const refreshToken = localStorage.getItem('ldr_refresh_token');
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${supaUrl}/auth/v1/token?grant_type=refresh_token`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': supaKey },
      body:    JSON.stringify({ refresh_token: refreshToken })
    });
    const data = await res.json();
    if (!res.ok || data.error) return false;
    setSessionToken(data.access_token);
    if (data.refresh_token) localStorage.setItem('ldr_refresh_token', data.refresh_token);
    currentUser = data.user;
    await loadProfile(data.access_token);
    return true;
  } catch (e) {
    return false;
  }
}

// ─── INIT ─────────────────────────────────

async function initAuth() {
  const supaUrl = 'https://biebfwwkukmxulzwpjya.supabase.co';
  const supaKey = 'sb_publishable_X13ybEk5Wl0a3e-XHhM5ew_IQcDk3wu';
  const token   = getSessionToken();
  if (!token) return false;

  try {
    const res = await fetch(`${supaUrl}/auth/v1/user`, {
      headers: { 'apikey': supaKey, 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      currentUser = await res.json();
      await loadProfile(token);
      return true;
    }
    return await refreshSession();
  } catch (e) {
    return await refreshSession();
  }
}

// ─── HELPERS ──────────────────────────────

function isAdmin() {
  return currentProfile?.role_code === 'A';
}

function getGameId() {
  return currentProfile?.game_id || '';
}
