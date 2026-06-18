
// export default async function handler(req, res) {
//   if (req.method !== 'POST') {
//     return res.status(405).end();
//   }

//   const response = await fetch(
//     'https://api.groq.com/openai/v1/audio/transcriptions',
//     {
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
//         'Content-Type': req.headers['content-type']
//       },
//       body: req
//     }
//   );

//   const data = await response.json();

//   res.status(response.status).json(data);
// }
export default async function handler(req, res) {
  console.log('--- ¡ENTRÓ A TRANSCRIBE! ---');

  if (req.method !== 'POST') {
    return res.status(405).send('Método no permitido');
  }

  try {
    console.log('Leyendo fragmentos de audio de la petición...');

    // 1. Recolectamos los fragmentos binarios directamente del request (req)
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    
    // Unimos los fragmentos en un Buffer en memoria
    const audioBuffer = Buffer.concat(chunks);
    console.log(`Audio recibido. Tamaño: ${audioBuffer.length} bytes`);

    if (audioBuffer.length === 0) {
      console.log('Error: No llegaron datos de audio.');
      return res.status(400).send('Audio vacío');
    }

    console.log('Antes de llamar a Groq con la Key directa');

    // 2. Convertimos el buffer a un archivo simulado para Groq
    const audioContentType = req.headers['content-type'] || 'audio/webm';
    const audioFile = new File([audioBuffer], 'recording.webm', { type: audioContentType });

    // 3. Preparamos el paquete que le enviaremos a Groq
    const groqFormData = new FormData();
    groqFormData.append('file', audioFile);
    groqFormData.append('model', 'whisper-large-v3-turbo');
    groqFormData.append('language', 'es');

    // 4. Petición directa a Groq con tu Key expuesta
    const response = await fetch(
      'https://api.groq.com/openai/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          // Tu Key puesta directamente aquí tal como querías para tus pruebas
          Authorization: 'Bearer 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'
        },
        body: groqFormData
      }
    );

    console.log('Status Groq:', response.status);

    const text = await response.text();
    console.log('Respuesta Groq:', text);

    // Devolvemos la respuesta al HTML
    if (response.ok) {
      return res.status(200).json(JSON.parse(text));
    } else {
      return res.status(response.status).send(text);
    }

  } catch (err) {
    console.error('ERROR CRÍTICO EN EL BACKEND:', err);
    return res.status(500).send(err.message);
  }
}
