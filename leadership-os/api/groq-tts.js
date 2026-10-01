import { requireAuth } from './_auth.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!requireAuth(req, res)) return;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Servidor sin configurar (GROQ_API_KEY).' });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const input = String(body.input || '').slice(0, 1000);
  if (!input) return res.status(400).json({ error: 'Texto vacío.' });

  try {
    const response = await fetch('https://api.groq.com/openai/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: String(body.model || 'playai-tts'),
        input,
        voice: String(body.voice || '').slice(0, 40),
        response_format: 'wav'
      })
    });

    if (!response.ok) {
      console.error('[groq-tts] Groq respondió', response.status, await response.text());
      return res.status(response.status).json({ error: 'Error al generar audio.' });
    }

    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Cache-Control', 'no-cache');
    return res.status(200).send(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.error('[groq-tts]', error);
    return res.status(500).json({ error: 'Error al generar audio.' });
  }
}
