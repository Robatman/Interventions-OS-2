export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  console.log('BODY RECEIVED:', JSON.stringify(req.body));

  try {
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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'
        },
        body: JSON.stringify(req.body)
      }
    );

    const text = await response.text();

    console.log('GROQ STATUS:', response.status);
    console.log('GROQ RESPONSE:', text.slice(0, 200));

    try {
      const data = JSON.parse(text);
      res.status(response.status).json(data);
    } catch {
      res.status(response.status).send(text);
    }

  } catch (err) {
    console.log('FETCH ERROR:', err.message);

    res.status(500).json({
      error: {
        message: err.message
      }
    });
  }
}
