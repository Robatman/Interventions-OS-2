# Centris Neural Academy (Leadership OS)

Simulador de entrenamiento para staff (coaches, supervisores, administrativos): aprender a **detectar posible attrition y dar seguimiento** con conversaciones realistas contra un agente simulado.

Funciona en **Meta Quest 3** (WebXR) y también **sin visor**, en el navegador de una computadora (arrastrar el mouse para mirar, clic en los botones).

## Qué se aprende

| Intervención | Hito | Objetivo |
|---|---|---|
| Pulse Check | 30 días | Primeras impresiones y onboarding |
| Anchoring | 100 días | Engagement y pertenencia |
| Stay Interview | 121 días | Riesgos de retención y necesidades no cubiertas |
| Tenure Renewal | 365 días | Reflexión y retención a largo plazo |

Las **14 técnicas** (Active Listening, Powerful Questions, etc.) son las herramientas para ejecutar esas conversaciones. Cada técnica tiene tres modos: Learn, Work Together y Practice.

La evaluación mide el balance entre **cumplir el objetivo de la empresa** y **aplicar la técnica** (sin ser solapador), la detección de señales de riesgo y el seguimiento.

## Estructura

```
leadership-os/
  index.html          Redirige a login-vr.html
  login-vr.html       Emparejamiento del visor/computadora con un código
  world.html          La app (escena A-Frame)
  js/
    interventions.js  Las 4 intervenciones: objetivo, criterios, escenarios
    archetypes.js     Agentes simulados (Carlos, Valeria, Miguel, Sandra, Karen)
    techniques.js     Las 14 técnicas
    preview.js        Ejemplos "cómo no / cómo sí" de cada técnica
    prompts.js        Prompts del avatar, del coach y de la evaluación
    case-engine.js    Crea UN caso por práctica (agente, escenario, ánimo, giros)
    ui3d.js           Interfaz 3D: ambiente, pantallas, avatares con caras y boca, efectos
    device-auth.js    Token del dispositivo emparejado (authFetch)
  api/                Funciones serverless (Vercel)
    _auth.js          Código de emparejamiento y token firmado (sin base de datos)
    pair.js           Cambia un código válido por un token
    groq.js           Chat (modelos permitidos, límites)
    transcribe.js     Voz a texto (Whisper)
    groq_speakvr.js   Texto a voz y traducción
  assets/ajolotes/    Modelos 3D (GLB) de Juanjolote y Ajolín y sus 9 caras (PNG)
  scripts/
    pairing-code.mjs  Genera el código de emparejamiento
```

## Acceso (sin cuentas)

1. En Vercel define la variable **`VR_TOKEN_SECRET`** (cadena larga y aleatoria, 32+ caracteres) en Production, Preview y Development. También `GROQ_API_KEY`.
2. Genera un código (dura 10 minutos):
   ```powershell
   $env:VR_TOKEN_SECRET = "<el mismo valor que en Vercel>"
   node scripts/pairing-code.mjs
   ```
3. Abre `login-vr.html` en el visor (o en la computadora), escribe el código y pulsa **EMPAREJAR**. Cada dispositivo se empareja una sola vez (el token dura 180 días).
   **Computadora prestada / invitado:** genera el código con `node scripts/pairing-code.mjs guest`. Ese acceso dura 3 horas y se borra al cerrar la pestaña, así que la computadora no queda emparejada.
4. Si se pierde un dispositivo: cambia `VR_TOKEN_EPOCH` en Vercel (por ejemplo a `2`) y vuelve a emparejar los demás.

Todos los endpoints `/api/*` exigen el token. El límite de uso por token es por instancia de Vercel (red de seguridad, no garantía).

## Variables de entorno

| Variable | Para qué |
|---|---|
| `VR_TOKEN_SECRET` | Firma de tokens y códigos (obligatoria) |
| `VR_TOKEN_EPOCH` | Invalida todos los tokens al cambiarla (opcional, por defecto `1`) |
| `GROQ_API_KEY` | Modelos de chat, voz a texto y texto a voz |

## Pendientes conocidos

- Pantalla de progreso ("My progress") con el nuevo diseño.
- Audios pregrabados para los guiones fijos.
- Voz más natural (streaming, turnos cortos, interrupciones).
