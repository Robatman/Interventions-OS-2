export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Toma la key enviada desde el cliente/localStorage o de Vercel
  const apiKey = req.body.apiKey || process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(400).json({ error: "No se proporcionó API Key de Groq." });
  }

  // Clona el body y remueve apiKey antes de mandarlo a Groq
  const groqBody = { ...req.body };
  delete groqBody.apiKey;

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
    return res.status(500).json({ error: err.message });
  }
}
