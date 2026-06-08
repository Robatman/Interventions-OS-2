export default async function handler(req, res) {
  const response = await fetch("https://api.groq.com/openai/v1/audio/speech", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req.body),
  });

  const audio = await response.arrayBuffer();

  res.setHeader("Content-Type", "audio/wav");
  res.send(Buffer.from(audio));
}
