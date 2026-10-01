import { getSecret, verifyPairingCode, signToken, rateLimit, clientIp } from './_auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = getSecret();
  if (!secret) return res.status(500).json({ error: 'Servidor sin configurar (VR_TOKEN_SECRET).' });

  // Freno a la fuerza bruta (por instancia)
  if (!rateLimit(`pair:${clientIp(req)}`, 8, 10 * 60_000)) {
    res.setHeader('Retry-After', '600');
    return res.status(429).json({ error: 'Demasiados intentos. Espera unos minutos.' });
  }

  const code = typeof req.body === 'object' && req.body ? req.body.code : '';
  const kind = verifyPairingCode(secret, code);
  if (!kind) {
    return res.status(401).json({ error: 'Código incorrecto o vencido.' });
  }

  const guest = kind === 'guest';
  const { token, exp } = signToken(secret, Date.now(), { guest });
  return res.status(200).json({ token, exp, guest });
}
