import { requireAuth } from './_auth.js';

// El servidor elige el modelo. No todas las cuentas de Groq tienen acceso a los mismos modelos,
// así que se prueban en orden de preferencia y se recuerda el primero que funcione.
// Para forzar uno: variable de entorno GROQ_CHAT_MODEL.
const PREFERRED_MODELS = [
  'llama-3.3-70b-versatile',
  'openai/gpt-oss-120b',
  'qwen/qwen3.8-27b',
  'openai/gpt-oss-20b',
  'llama-3.1-8b-instant',
];
const MAX_TOKENS_CAP = 600;
const MAX_MESSAGES   = 40;
const MAX_CHARS      = 24000;
const BLOCK_MS       = 10 * 60 * 1000;

let lastGood = null;              // último modelo que respondió bien (por instancia)
const blocked = new Map();        // modelo -> hasta cuándo se evita

// Cada familia de modelos acepta parámetros de razonamiento distintos
function reasoningParams(model) {
  if (model.startsWith('qwen/')) return { reasoning_effort: 'none', reasoning_format: 'hidden' };
  if (model.startsWith('openai/gpt-oss')) return { reasoning_effort: 'low', include_reasoning: false };
  return {};
}

function candidates() {
  const list = [process.env.GROQ_CHAT_MODEL, lastGood, ...PREFERRED_MODELS].filter(Boolean);
  const now = Date.now();
  const unique = [...new Set(list)].filter((m) => !(blocked.get(m) > now));
  // Si todos estuvieran bloqueados, se vuelve a intentar con la lista completa
  return unique.length ? unique : [...new Set(PREFERRED_MODELS)];
}

function isModelAccessError(status, data) {
  const msg = String(data?.error?.message || '');
  return data?.error?.code === 'model_not_found' || /does not exist or you do not have access|model_not_found|decommissioned|has been deprecated/i.test(msg);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  if (!requireAuth(req, res)) return;

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const { messages } = body;

  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return res.status(400).json({ error: "Mensajes inválidos." });
  }
  const chars = messages.reduce((n, m) => n + String(m?.content ?? "").length, 0);
  if (chars > MAX_CHARS) {
    return res.status(400).json({ error: "Conversación demasiado larga." });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Servidor sin configurar (GROQ_API_KEY)." });
  }

  // Solo se reenvían los campos conocidos (nada de apiKey ni parámetros extra)
  const base = {
    messages: messages.map((m) => ({ role: String(m.role), content: String(m.content ?? "") })),
    max_tokens: Math.min(Number(body.max_tokens) || 300, MAX_TOKENS_CAP),
    temperature: Math.min(Math.max(Number(body.temperature) || 0.8, 0), 1.5),
  };

  let lastStatus = 500;
  let lastData = { error: "Error al contactar el modelo." };

  for (const model of candidates()) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ ...base, model, ...reasoningParams(model) }),
      });
      const data = await response.json();

      if (response.ok) {
        lastGood = model;
        res.setHeader("X-Model-Used", model);
        return res.status(200).json(data);
      }

      lastStatus = response.status;
      lastData = data;
      console.error("[groq]", model, "->", response.status, JSON.stringify(data).slice(0, 300));

      if (isModelAccessError(response.status, data)) {
        blocked.set(model, Date.now() + BLOCK_MS);
        if (lastGood === model) lastGood = null;
        continue; // probar el siguiente modelo
      }
      break; // otro tipo de error (límite de uso, petición inválida…): no tiene sentido reintentar
    } catch (err) {
      console.error("[groq]", model, err);
      lastStatus = 500;
      lastData = { error: "Error al contactar el modelo." };
      break;
    }
  }

  return res.status(lastStatus).json(lastData);
}
