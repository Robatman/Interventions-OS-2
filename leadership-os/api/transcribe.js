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
    // 1. En entornos modernos (Next.js/Vercel), podemos usar Web Request APIs
    // Convertimos la petición de Node.js a una Web Request estándar para leer el FormData nativamente
    const protocol = req.headers["x-forwarded-proto"] || "http";
    const host = req.headers.host;
    const webRequest = new Request(`${protocol}://${host}${req.url}`, {
      method: req.method,
      headers: req.headers,
      body: req, // Pasamos el stream directamente
      duplex: "half", // Requerido en Node.js para pasar streams en fetch/Request
    });

    // 2. Extraemos el FormData de manera nativa
    const formDataClient = await webRequest.formData();
    const audioBlob = formDataClient.get("file");

    if (!audioBlob) {
      return res.status(400).json({ error: "No se proporcionó ningún archivo de audio" });
    }

    // 3. Creamos el nuevo FormData nativo que enviaremos a Groq Cloud
    const groqForm = new FormData();
    groqForm.append("file", audioBlob, "rec.webm");
    groqForm.append("model", "whisper-large-v3-turbo");
    groqForm.append("language", "es");
    groqForm.append("response_format", "json");

    // 4. Enviamos la petición a Groq
    console.log("[Backend] Reenviando audio a Groq Cloud...");
    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        // El fetch nativo calcula automáticamente el Content-Type boundary correcto
      },
      body: groqForm,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Backend] Error de Groq:", errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    return res.status(200).json({ text: data.text || "" });

  } catch (error) {
    console.error("[Backend] Error crítico:", error);
    return res.status(500).json({ error: error.message });
  }
}

// Desactivamos el bodyParser nativo para poder procesar nosotros el stream
export const config = {
  api: {
    bodyParser: false,
  },
};
