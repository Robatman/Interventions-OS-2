export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  console.log('KEY EXISTS:', !!process.env.GROQ_API_KEY);
  console.log('KEY START:', process.env.GROQ_API_KEY?.slice(0, 20));

  return res.status(200).json({
    ok: true
  });
}
  const response = await fetch('https://api.groq.com/openai/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify(req.body)
  });

  if (!response.ok) {
    const err = await response.text();
    return res.status(response.status).send(err);
  }

  const buffer = await response.arrayBuffer();
  res.setHeader('Content-Type', 'audio/wav');
  res.status(200).send(Buffer.from(buffer));
}
