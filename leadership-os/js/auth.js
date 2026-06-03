// ═══════════════════════════════════════════
//  auth.js — Leadership OS
//  Game ID authentication via Supabase Auth
//  Roles: A=Admin, R=Reclutamiento, C=Coach,
//         Q=QA, T=Trainer, M=Manager
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
// Format: [Role][Initial].[LASTNAME]
// Example: AA.JIMENEZ, CM.RODRIGUEZ, TL.GARCIA

function validateGameId(gameId) {
  if (!gameId || typeof gameId !== 'string') return false;
  const upper = gameId.toUpperCase().trim();
  // Regex: 1 role letter + 1 name initial + dot + 2+ uppercase letters
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
  // Auto-format as user types: uppercase, insert dot at position 2
  let v = raw.toUpperCase().replace(/[^A-Z.]/g, '');
  if (v.length >= 3 && v[2] !== '.') {
    v = v.slice(0, 2) + '.' + v.slice(2);
  }
  return v;
}

// ─── SUPABASE AUTH ────────────────────────
// We use Game ID as the "email" field in Supabase Auth
// by appending a fixed domain. This avoids needing real emails.

const FAKE_DOMAIN = '@leadershipos.internal';

function gameIdToEmail(gameId) {
  return gameId.toUpperCase().trim() + FAKE_DOMAIN;
}

// ─── CURRENT USER ─────────────────────────

let currentUser     = null;  // Supabase auth user
let currentProfile  = null;  // user_profiles row

async function getCurrentUser() {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'apikey':        SUPABASE_KEY,
        'Authorization': `Bearer ${getSessionToken()}`
      }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

function getSessionToken() {
  try {
    const raw = localStorage.getItem('ldr_session_token');
    return raw || '';
  } catch (e) { return ''; }
}

function setSessionToken(token) {
  try {
    localStorage.setItem('ldr_session_token', token);
  } catch (e) {}
}

function clearSessionToken() {
  try {
    localStorage.removeItem('ldr_session_token');
    localStorage.removeItem('ldr_refresh_token');
  } catch (e) {}
}

// ─── REGISTER ─────────────────────────────

async function registerUser(gameId, password) {
  const email = gameIdToEmail(gameId);
  const parsed = parseGameId(gameId);

  // 1. Create auth user
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey':        SUPABASE_KEY
    },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error?.message || data.msg || 'Registration failed');
  }

  const userId = data.user?.id;
  const token  = data.access_token;

  if (!userId) throw new Error('No user ID returned');

  // 2. Create profile
  await fetch(`${SUPABASE_URL}/rest/v1/user_profiles`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'apikey':         SUPABASE_KEY,
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
  if (data.refresh_token) {
    localStorage.setItem('ldr_refresh_token', data.refresh_token);
  }

  currentUser    = data.user;
  currentProfile = { game_id: gameId.toUpperCase(), role_code: parsed.roleCode, display_name: `${parsed.nameInitial}. ${parsed.lastName}` };

  return { user: data.user, profile: currentProfile };
}

// ─── LOGIN ────────────────────────────────

async function loginUser(gameId, password) {
  const email = gameIdToEmail(gameId);

  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey':        SUPABASE_KEY
    },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error_description || data.error || 'Login failed');
  }

  setSessionToken(data.access_token);
  if (data.refresh_token) {
    localStorage.setItem('ldr_refresh_token', data.refresh_token);
  }

  currentUser = data.user;

  // Load profile
  await loadProfile(data.access_token);

  return { user: data.user, profile: currentProfile };
}

// ─── LOAD PROFILE ─────────────────────────

async function loadProfile(token) {
  try {
    const t = token || getSessionToken();
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/user_profiles?select=*&limit=1`,
      {
        headers: {
          'apikey':        SUPABASE_KEY,
          'Authorization': `Bearer ${t}`
        }
      }
    );
    const rows = await res.json();
    currentProfile = rows[0] || null;
  } catch (e) {
    currentProfile = null;
  }
}

// ─── LOGOUT ───────────────────────────────

async function logoutUser() {
  try {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method:  'POST',
      headers: {
        'apikey':        SUPABASE_KEY,
        'Authorization': `Bearer ${getSessionToken()}`
      }
    });
  } catch (e) {}
  clearSessionToken();
  currentUser    = null;
  currentProfile = null;
}

// ─── REFRESH TOKEN ────────────────────────

async function refreshSession() {
  const refreshToken = localStorage.getItem('ldr_refresh_token');
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey':        SUPABASE_KEY
      },
      body: JSON.stringify({ refresh_token: refreshToken })
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

// ─── INIT — check existing session ────────

async function initAuth() {
  const token = getSessionToken();
  if (!token) return false;

  // Try to load user with existing token
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'apikey':        SUPABASE_KEY,
        'Authorization': `Bearer ${token}`
      }
    });
    if (res.ok) {
      currentUser = await res.json();
      await loadProfile(token);
      return true;
    }
    // Token expired — try refresh
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

function getUserId() {
  // Override supabase.js getUserId with real auth user id
  if (currentUser?.id) return currentUser.id;
  // Fallback to anonymous
  let uid = localStorage.getItem('ldr_uid');
  if (!uid) {
    uid = 'anon_' + Math.random().toString(36).slice(2, 11);
    localStorage.setItem('ldr_uid', uid);
  }
  return uid;
}
