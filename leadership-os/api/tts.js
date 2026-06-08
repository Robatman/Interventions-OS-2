export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  // Debug de API Key
  console.log('KEY EXISTS:', !!process.env.GROQ_API_KEY);
  console.log('KEY START:', process.env.GROQ_API_KEY?.slice(0, 10));

  try {

    // Mostrar body recibido
    console.log('BODY:', req.body);

    const response = await fetch(
      'https://api.groq.com/openai/v1/audio/speech',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify(req.body)
      }
    );

    console.log('GROQ STATUS:', response.status);

    // Si Groq responde error
    if (!response.ok) {
      const err = await response.text();
      console.log('GROQ ERROR:', err);

      return res
        .status(response.status)
        .send(err);
    }

    // Convertir audio
const audioBuffer = Buffer.from(await response.arrayBuffer());

res.setHeader('Content-Type', 'audio/wav');

return res.status(200).send(audioBuffer);
    console.log('Audio generado correctamente');

    // Headers para mp3
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-cache');

    // Enviar audio
    return res
      .status(200)
      .send(Buffer.from(buffer));

  } catch (error) {

    console.error('SERVER ERROR:', error);

    return res.status(500).json({
      error: error.message
    });
  }
}


console.log('Hola si estoy entrando pero no se jajajaj')
