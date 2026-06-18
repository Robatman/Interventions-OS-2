export default async function handler(req, res) {

  console.log('========== API GROQ TTS ==========');

  // Solo permitir POST
  if (req.method !== 'POST') {

    console.log('Método inválido:', req.method);

    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {

    // Revisar API Key
    const apiKey = process.env.GROQ_API_KEY;

    console.log('KEY EXISTS:', !!apiKey);

    if (!apiKey) {

      console.log('❌ NO EXISTE GROQ_API_KEY');

      return res.status(500).json({
        error: 'GROQ_API_KEY no configurada'
      });
    }

    // Mostrar body recibido
    console.log('BODY:', req.body);

    // Request a Groq
    const response = await fetch(
      'https://api.groq.com/openai/v1/audio/speech',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(req.body)
      }
    );

    console.log('GROQ STATUS:', response.status);

    // Si Groq responde error
    if (!response.ok) {

      const errorText = await response.text();

      console.log('========== GROQ ERROR ==========');
      console.log(errorText);
      console.log('================================');

      return res.status(response.status).send(errorText);
    }

    // Convertir audio
    const arrayBuffer = await response.arrayBuffer();

    const audioBuffer = Buffer.from(arrayBuffer);

    console.log('✅ Audio generado correctamente');
    console.log('Buffer size:', audioBuffer.length);

    // IMPORTANTE:
    // Estás usando WAV
    res.setHeader('Content-Type', 'audio/wav');

    // Evitar cache
    res.setHeader('Cache-Control', 'no-cache');

    // Enviar audio
    return res.status(200).send(audioBuffer);

  } catch (error) {

    console.log('========== SERVER ERROR ==========');

    console.error(error);

    console.log('==================================');

    return res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
}

console.log('Archivo groq-tts cargado');
