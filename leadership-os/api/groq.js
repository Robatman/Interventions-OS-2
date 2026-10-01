import { requireAuth } from './_auth.js';

// El modelo lo decide el servidor (variable GROQ_CHAT_MODEL, o el valor por defecto).
// El cliente ya no depende de un nombre de modelo: si un modelo se retira, solo se cambia aquí.
// Por defecto un modelo de producción (los "preview" de Groq pueden retirarse sin aviso).
const DEFAULT_MODEL = process.env.GROQ_CHAT_MODEL || 'llama-3.3-70b-versatile';
const ALLOWED_MODELS = new Set([
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.8-27b',
]);
const MAX_TOKENS_CAP = 600;
const MAX_MESSAGES   = 40;
const MAX_CHARS      = 24000;

// Cada familia de modelos acepta parámetros de razonamiento distintos
function reasoningParams(model) {
  if (model.startsWith('qwen/')) return { reasoning_effort: 'none', reasoning_format: 'hidden' };
  if (model.startsWith('openai/gpt-oss')) return { reasoning_effort: 'low', include_reasoning: false };
  return {};
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  if (!requireAuth(req, res)) return;

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const { messages } = body;

  // Un nombre de modelo ausente, retirado o desconocido cae en el modelo por defecto
  const model = ALLOWED_MODELS.has(body.model) ? body.model : DEFAULT_MODEL;

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
  const groqBody = {
    model,
    messages: messages.map((m) => ({ role: String(m.role), content: String(m.content ?? "") })),
    max_tokens: Math.min(Number(body.max_tokens) || 300, MAX_TOKENS_CAP),
    temperature: Math.min(Math.max(Number(body.temperature) || 0.8, 0), 1.5),
    ...reasoningParams(model),
  };

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(groqBody),
    });

    const data = await response.json();
    if (!response.ok) console.error("[groq] Groq respondió", response.status, JSON.stringify(data).slice(0, 300));
    return res.status(response.status).json(data);
  } catch (err) {
    console.error("[groq]", err);
    return res.status(500).json({ error: "Error al contactar el modelo." });
  }
}
