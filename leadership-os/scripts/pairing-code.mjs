// Genera el código para emparejar un visor o una computadora (vale 10 minutos para teclearlo).
//
//   Sin argumentos : dispositivo propio (acceso de 180 días, queda guardado)
//   guest          : INVITADO (acceso de 3 horas y se borra al cerrar la pestaña)
//
//   PowerShell:  $env:VR_TOKEN_SECRET="<el mismo valor que en Vercel>"; node scripts/pairing-code.mjs [guest]
//   Bash:        VR_TOKEN_SECRET="<el mismo valor que en Vercel>" node scripts/pairing-code.mjs [guest]

import { createRequire } from 'node:module';
const { getSecret, currentPairingCode } = createRequire(import.meta.url)('../api/_auth.js');

const secret = getSecret();
if (!secret) {
  console.error('Falta VR_TOKEN_SECRET (mínimo 16 caracteres, igual que en Vercel).');
  process.exit(1);
}
const guest = process.argv[2] === 'guest';
const { code, expiresInSec } = currentPairingCode(secret, Date.now(), guest ? 'guest' : 'pair');
console.log(`\n  ${guest ? 'Código de INVITADO (3 horas, se borra al cerrar la pestaña)' : 'Código de emparejamiento'}:  ${code.slice(0, 4)}-${code.slice(4)}`);
console.log(`  Vence en ${Math.floor(expiresInSec / 60)} min ${expiresInSec % 60} s para teclearlo\n`);
