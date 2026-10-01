import { requireAuth } from './_auth.js';

// Solo estos modelos pueden usarse desde los visores.
const ALLOWED_MODELS = new Set([
  'qwen/qwen3.6-27b',
  'openai/gpt-oss-120b',
  'llama-3.3-70b-versatile',
]);
const MAX_TOKENS_CAP = 600;
const MAX_MESSAGES   = 40;
const MAX_CHARS      = 24000;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  if (!requireAuth(req, res)) return;

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const { model, messages } = body;

  if (!ALLOWED_MODELS.has(model)) {
    return res.status(400).json({ error: "Modelo no permitido." });
  }
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
  };
  if (body.reasoning_effort) groqBody.reasoning_effort = String(body.reasoning_effort);
  if (body.reasoning_format) groqBody.reasoning_format = String(body.reasoning_format);

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
    return res.status(response.status).json(data);
  } catch (err) {
    console.error("[groq]", err);
    return res.status(500).json({ error: "Error al contactar el modelo." });
  }
}
