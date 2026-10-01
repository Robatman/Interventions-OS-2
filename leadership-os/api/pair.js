import { getSecret, verifyPairingCode, signToken, rateLimit, clientIp } from './_auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = getSecret();
  if (!secret) {
    // TEMPORAL (diagnóstico): no revela el secreto, solo si existe y cuánto mide
    const raw = process.env.VR_TOKEN_SECRET;
    const diag = `entorno=${process.env.VERCEL_ENV || '?'} variable=${raw === undefined ? 'NO existe' : 'existe, largo ' + raw.length} commit=${(process.env.VERCEL_GIT_COMMIT_SHA || '?').slice(0, 7)}`;
    return res.status(500).json({ error: `Servidor sin configurar (VR_TOKEN_SECRET). [${diag}]` });
  }

  // Freno a la fuerza bruta (por instancia)
  if (!rateLimit(`pair:${clientIp(req)}`, 8, 10 * 60_000)) {
    res.setHeader('Retry-After', '600');
    return res.status(429).json({ error: 'Demasiados intentos. Espera unos minutos.' });
  }

  const code = typeof req.body === 'object' && req.body ? req.body.code : '';
  if (!verifyPairingCode(secret, code)) {
    return res.status(401).json({ error: 'Código incorrecto o vencido.' });
  }

  const { token, exp } = signToken(secret);
  return res.status(200).json({ token, exp });
}
