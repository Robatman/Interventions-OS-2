
export default async function handler(req, res) {

  const API_KEY = "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";

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    const { type, text, voice } = req.body;

    // =========================
    // TRADUCCIÓN
    // =========================

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
                content:
                  "Translate the following text to natural English. Only return the translation.",
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
        translation:
          data.choices?.[0]?.message?.content || text
      });
    }

    // =========================
    // TTS
    // =========================

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
