export default async function handler(req, res) {
  const API_KEY = process.env.GROQ_API_KEY;

  if (!API_KEY) {
    console.error("Falta la configuración de GROQ_API_KEY en las variables de entorno.");
    return res.status(500).json({ error: "Internal server error: Missing API configuration." });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const FormData = require('form-data');
  
    const formidable = require('formidable');
    const fs = require('fs');

    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: "Error procesando el archivo de audio" });
      }

      const audioFile = files.file?.[0] || files.file; // Depende de la versión de formidable
      if (!audioFile) {
        return res.status(400).json({ error: "No se proporcionó ningún archivo de audio" });
      }

      // Creamos el nuevo formulario para Groq
      const groqForm = new FormData();
      groqForm.append('file', fs.createReadStream(audioFile.filepath), 'rec.webm');
      groqForm.append('model', 'whisper-large-v3-turbo');
      groqForm.append('language', 'es');
      groqForm.append('response_format', 'json');

      try {
        const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            ...groqForm.getHeaders() // Esto pone los límites (boundaries) correctos de multipart
          },
          body: groqForm
        });

        if (!response.ok) {
          const errorText = await response.text();
          return res.status(response.status).json({ error: errorText });
        }

        const data = await response.json();
        return res.status(200).json({ text: data.text || '' });

      } catch (fetchError) {
        console.error('[Backend] Error en Groq:', fetchError);
        return res.status(500).json({ error: "Error de conexión con el servicio de transcripción" });
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}

// OBLIGATORIO SI USAS NEXT.JS: Desactivar el body parser nativo para que formidable pueda leer el archivo
export const config = {
  api: {
    bodyParser: false,
  },
};
