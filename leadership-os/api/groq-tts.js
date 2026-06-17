export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const response = await fetch('https://api.groq.com/openai/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${process.env.Interventions}`
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
