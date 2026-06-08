export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { text, voice = 'nova' } = req.body;

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${
        process.env.OPENAI_API_KEY || process.env.OPENAIAPIKEY
      }`
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: text,
      voice,
      response_format: 'mp3'
    })
  });

  if (!response.ok) {
    const err = await response.text();
    return res.status(response.status).send(err);
  }

  const buffer = await response.arrayBuffer();
  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).send(Buffer.from(buffer));
}
