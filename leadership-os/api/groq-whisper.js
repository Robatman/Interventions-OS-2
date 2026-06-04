/**
 * api/groq-whisper.js — Vercel Serverless Function
 * Recibe audio (multipart/form-data) → Groq Whisper → texto
 * 
 * Igual que groq.js pero para transcripción de voz
 */

export const config = {
  api: {
    bodyParser: false, // Necesario para recibir audio binario
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    // Leer el body raw (stream de audio)
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const rawBody = Buffer.concat(chunks);

    // Extraer el Content-Type con boundary para multipart
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return res.status(400).json({ error: 'Expected multipart/form-data' });
    }

    // Reenviar directo a Groq Whisper API
    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': contentType, // Incluye el boundary
      },
      body: rawBody,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[groq-whisper] Error de Groq:', data);
      return res.status(response.status).json(data);
    }

    // Groq Whisper regresa: { text: "..." }
    res.status(200).json({
      text: data.text || '',
      language: data.language || 'es',
    });

  } catch (err) {
    console.error('[groq-whisper] Error:', err);
    res.status(500).json({ error: err.message });
  }
}
