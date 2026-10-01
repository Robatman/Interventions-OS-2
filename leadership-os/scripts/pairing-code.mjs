// Genera el código para emparejar un visor (vale 10 minutos).
//
//   PowerShell:  $env:VR_TOKEN_SECRET="<el mismo valor que en Vercel>"; node scripts/pairing-code.mjs
//   Bash:        VR_TOKEN_SECRET="<el mismo valor que en Vercel>" node scripts/pairing-code.mjs

import { getSecret, currentPairingCode } from '../api/_auth.mjs';

const secret = getSecret();
if (!secret) {
  console.error('Falta VR_TOKEN_SECRET (mínimo 16 caracteres, igual que en Vercel).');
  process.exit(1);
}
const { code, expiresInSec } = currentPairingCode(secret);
console.log(`\n  Código de emparejamiento:  ${code.slice(0, 4)}-${code.slice(4)}`);
console.log(`  Vence en ${Math.floor(expiresInSec / 60)} min ${expiresInSec % 60} s\n`);
