export default async function handler(req, res) {
  // Jalamos la variable de entorno de Groq
  const API_KEY = process.env.GROQ_API_KEY;

  // Validación por si olvidas configurar la variable en tu entorno
  if (!API_KEY) {
    console.error("Falta la configuración de GROQ_API_KEY en las variables de entorno.");
    return res.status(500).json({
      error: "Internal server error: Missing API configuration."
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { type, text, voice, technique, level, agentName } = req.body;

    // ==========================================
    // CHAT CON AGENTE DE IA (CON NIVEL DE DIFICULTAD)
    // ==========================================
    if (type === "chat") {
      // 1. Definimos las reglas de dificultad en base al nivel recibido
      let instruccionesDificultad = "";
      
      if (level === 'novice') {
        instruccionesDificultad = "Adopta un nivel de dificultad FÁCIL. Sé muy cooperativo, expresa tus emociones de manera evidente y no interrumpas. Tus respuestas deben ser cortas y directas.";
      } else if (level === 'mid' || level === 'intermediate') {
        instruccionesDificultad = "Adopta un nivel de dificultad INTERMEDIO (Moderado). Muestra cierta resistencia inicial, utiliza evasivas realistas y exige que el usuario aplique adecuadamente la técnica para abrirte.";
      } else if (level === 'adv' || level === 'expert') {
        instruccionesDificultad = "Adopta un nivel de dificultad DIFÍCIL (Experto). Estás sumamente cerrado, a la defensiva o muy frustrado. Si el usuario no aplica de manera impecable la técnica desde el inicio, responde de manera cortante, evade las preguntas o usa monosílabos.";
      } else {
        // Por si llega vacío o sin inicializar
        instruccionesDificultad = "Adopta un nivel de dificultad estándar/moderado.";
      }

      // 2. Construimos el System Prompt dinámico
      const systemPrompt = `Eres un personaje de simulación llamado ${agentName || 'Cliente'}.
Estamos en un entrenamiento de liderazgo sobre la técnica de comunicación: "${technique || 'General'}".
Reglas de dificultad que DEBES seguir estrictamente: ${instruccionesDificultad}
Responde en un tono natural, conversacional, simulando ser la persona del escenario. Mantén tu papel pase lo que pase.`;

      // 3. Hacemos la llamada al modelo LLM de Groq
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
              {
                role: "user",
                content: text,
              },
            ],
            temperature: level === 'adv' ? 0.8 : 0.5, // Más impredecible en experto
          }),
        }
      );

      const data = await response.json();
      return res.status(200).json({
        response: data.choices?.[0]?.message?.content || "No pude generar una respuesta."
      });
    }

    // ==========================================
    // TRADUCCIÓN (Original)
    // ==========================================
    if (type === "translate") {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content: "Translate the following text to natural English. Only return the translation.",
              },
              {
                role: "user",
                content: text,
              },
            ],
            temperature: 0.2,
          }),
        }
      );

      const data = await response.json();

      return res.status(200).json({
        translation: data.choices?.[0]?.message?.content || text
      });
    }

    // ==========================================
    // TTS (Original)
    // ==========================================
    if (type === "speech") {
      const response = await fetch(
        "https://api.groq.com/openai/v1/audio/speech",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "canopylabs/orpheus-v1-english",
            voice: voice || "autumn",
            response_format: "wav",
            input: text,
          }),
        }
      );

      if (!response.ok) {
        const err = await response.text();
        console.error("GROQ ERROR:", err);
        return res.status(500).json({
          error: err
        });
      }

      const buffer = await response.arrayBuffer();
      res.setHeader("Content-Type", "audio/wav");
      return res.status(200).send(Buffer.from(buffer));
    }

    return res.status(400).json({
      error: "Invalid type"
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: err.message
    });
  }
}
