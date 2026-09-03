// ═══════════════════════════════════════════
//  auth.js — Leadership OS v5 NO-DB
//  Auth local sin Supabase
//  Usuario hardcodeado: AB.ATMAN
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

// ─── USUARIOS HARDCODEADOS ────────────────
// Para agregar más usuarios: { gameId, password, roleCode }
const HARDCODED_USERS = [
  { gameId: 'AB.ATMAN',    password: 'Batman2024', roleCode: 'A' },
  { gameId: 'CM.RODRIGUEZ', password: 'Coach2024',  roleCode: 'C' },
  { gameId: 'MM.GARCIA',   password: 'Manager2024', roleCode: 'M' }
];

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

// ─── SESSION ──────────────────────────────

let currentUser    = null;
let currentProfile = null;

function getSessionToken() {
  try { return localStorage.getItem('ldr_session_token') || ''; }
  catch(e) { return ''; }
}

function setSessionToken(token) {
  try { localStorage.setItem('ldr_session_token', token); }
  catch(e) {}
}

function clearSessionToken() {
  try {
    localStorage.removeItem('ldr_session_token');
    localStorage.removeItem('ldr_game_id');
  } catch(e) {}
}

function getUserId() {
  if (currentUser?.id) return currentUser.id;
  let uid = localStorage.getItem('ldr_uid');
  if (!uid) {
    uid = 'user_' + Math.random().toString(36).slice(2, 11);
    localStorage.setItem('ldr_uid', uid);
  }
  return uid;
}

// ─── LOGIN ────────────────────────────────

async function loginUser(gameId, password) {
  const upper = gameId.toUpperCase().trim();
  const user  = HARDCODED_USERS.find(
    u => u.gameId === upper && u.password === password
  );

  if (!user) {
    throw new Error('Incorrect Game ID or password.');
  }

  const parsed = parseGameId(upper);
  const token  = 'local_' + Date.now();

  setSessionToken(token);
  localStorage.setItem('ldr_game_id', upper);

  currentUser = { id: 'local_' + upper, email: upper };
  currentProfile = {
    game_id:      upper,
    role_code:    user.roleCode,
    display_name: `${parsed.nameInitial}. ${parsed.lastName}`,
    is_active:    true
  };

  return { user: currentUser, profile: currentProfile };
}

// ─── REGISTER ─────────────────────────────
// Sin DB — el registro no persiste
// Para agregar usuarios permanentes, editar HARDCODED_USERS

async function registerUser(gameId, password) {
  if (gameId.toUpperCase()[0] === 'A') {
    throw new Error('El rol Admin no está disponible para registro.');
  }

  const upper  = gameId.toUpperCase().trim();
  const parsed = parseGameId(upper);
  const token  = 'local_' + Date.now();

  setSessionToken(token);
  localStorage.setItem('ldr_game_id', upper);

  currentUser = { id: 'local_' + upper, email: upper };
  currentProfile = {
    game_id:      upper,
    role_code:    parsed.roleCode,
    display_name: `${parsed.nameInitial}. ${parsed.lastName}`,
    is_active:    true
  };

  return { user: currentUser, profile: currentProfile };
}

// ─── LOGOUT ───────────────────────────────

async function logoutUser() {
  clearSessionToken();
  currentUser    = null;
  currentProfile = null;
}

// ─── INIT ─────────────────────────────────

async function initAuth() {
  const token  = getSessionToken();
  const gameId = localStorage.getItem('ldr_game_id');

  if (!token || !gameId) return false;

  const parsed = parseGameId(gameId);
  currentUser  = { id: 'local_' + gameId, email: gameId };
  currentProfile = {
    game_id:      gameId,
    role_code:    gameId[0],
    display_name: `${parsed.nameInitial}. ${parsed.lastName}`,
    is_active:    true
  };

  return true;
}

// ─── HELPERS ──────────────────────────────

function isAdmin() {
  return currentProfile?.role_code === 'A';
}

function getGameId() {
  return currentProfile?.game_id || localStorage.getItem('ldr_game_id') || '';
}
