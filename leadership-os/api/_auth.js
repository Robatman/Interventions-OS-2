// ═══════════════════════════════════════════════════════════
//  _auth.js — acceso por visor emparejado (sin base de datos)
//
//  Variables de entorno en Vercel:
//    VR_TOKEN_SECRET  (obligatoria) cadena larga y aleatoria (32+ caracteres)
//    VR_TOKEN_EPOCH   (opcional)    súbela (2, 3…) para invalidar TODOS los
//                                   visores emparejados a la vez
//
//  Flujo:
//    1. scripts/pairing-code.mjs genera un código de emparejamiento (10 min)
//    2. El visor lo envía a /api/pair y recibe un token firmado (180 días)
//    3. Cada endpoint exige  Authorization: Bearer <token>
// ═══════════════════════════════════════════════════════════

const crypto = require('node:crypto');

const TOKEN_TTL_MS = 180 * 24 * 60 * 60 * 1000;
const PAIR_WINDOW_MS = 10 * 60 * 1000;
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin 0/O/1/I

const b64u = (buf) => Buffer.from(buf).toString('base64url');
const hmac = (secret, data) => crypto.createHmac('sha256', secret).update(data).digest();

function safeEqual(a, b) {
  const ba = Buffer.from(a), bb = Buffer.from(b);
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

function getSecret() {
  const s = process.env.VR_TOKEN_SECRET;
  return s && s.length >= 16 ? s : null;
}

const currentEpoch = () => String(process.env.VR_TOKEN_EPOCH || '1');

// ─── Código de emparejamiento (sin estado, por ventana de tiempo) ──────
function pairingCodeFor(secret, windowIndex) {
  const d = hmac(secret, `pair:${windowIndex}`);
  let out = '';
  for (let i = 0; i < 8; i++) out += ALPHABET[d[i] % ALPHABET.length];
  return out;
}

function currentPairingCode(secret, now = Date.now()) {
  const w = Math.floor(now / PAIR_WINDOW_MS);
  return {
    code: pairingCodeFor(secret, w),
    expiresInSec: Math.ceil(((w + 1) * PAIR_WINDOW_MS - now) / 1000),
  };
}

function verifyPairingCode(secret, input, now = Date.now()) {
  const clean = String(input || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (clean.length !== 8) return false;
  const w = Math.floor(now / PAIR_WINDOW_MS);
  // Acepta la ventana actual y la anterior (por si se generó justo antes del corte)
  return [w, w - 1].some((i) => safeEqual(clean, pairingCodeFor(secret, i)));
}

// ─── Token del visor ───────────────────────────────────────────────────
function signToken(secret, now = Date.now()) {
  const payload = b64u(JSON.stringify({
    v: 1,
    iat: now,
    exp: now + TOKEN_TTL_MS,
    e: currentEpoch(),
    id: crypto.randomBytes(6).toString('hex'),
  }));
  return { token: `${payload}.${b64u(hmac(secret, payload))}`, exp: now + TOKEN_TTL_MS };
}

function verifyToken(secret, token, now = Date.now()) {
  if (typeof token !== 'string' || token.length > 400) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  if (!safeEqual(sig, b64u(hmac(secret, payload)))) return null;
  try {
    const p = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (p.v !== 1 || p.e !== currentEpoch() || !(p.exp > now)) return null;
    return p;
  } catch {
    return null;
  }
}

// ─── Límite de uso (por instancia; red de seguridad, no garantía) ──────
const buckets = new Map();
function rateLimit(key, max, windowMs, now = Date.now()) {
  const b = buckets.get(key);
  if (!b || now > b.reset) {
    buckets.set(key, { n: 1, reset: now + windowMs });
    if (buckets.size > 5000) for (const [k, v] of buckets) if (now > v.reset) buckets.delete(k);
    return true;
  }
  return ++b.n <= max;
}

function clientIp(req) {
  return String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
}

/**
 * Exige un token válido. Devuelve true si se puede continuar; si no,
 * ya respondió (401 / 429 / 500) y el endpoint debe hacer `return`.
 */
function requireAuth(req, res, { perMinute = 40 } = {}) {
  const secret = getSecret();
  if (!secret) {
    res.status(500).json({ error: 'Servidor sin configurar (VR_TOKEN_SECRET).' });
    return false;
  }
  const header = String(req.headers.authorization || '');
  const claims = header.startsWith('Bearer ') ? verifyToken(secret, header.slice(7)) : null;
  if (!claims) {
    res.status(401).json({ error: 'Visor no emparejado.' });
    return false;
  }
  if (!rateLimit(`tok:${claims.id}`, perMinute, 60_000)) {
    res.setHeader('Retry-After', '60');
    res.status(429).json({ error: 'Demasiadas solicitudes. Espera un momento.' });
    return false;
  }
  return true;
}

// CommonJS a propósito: Vercel compila las funciones de api/ a CommonJS y
// así este módulo se carga igual en Vercel, en Node y en scripts/.
exports.TOKEN_TTL_MS = TOKEN_TTL_MS;
exports.PAIR_WINDOW_MS = PAIR_WINDOW_MS;
exports.getSecret = getSecret;
exports.pairingCodeFor = pairingCodeFor;
exports.currentPairingCode = currentPairingCode;
exports.verifyPairingCode = verifyPairingCode;
exports.signToken = signToken;
exports.verifyToken = verifyToken;
exports.rateLimit = rateLimit;
exports.clientIp = clientIp;
exports.requireAuth = requireAuth;
