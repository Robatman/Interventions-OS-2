
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
 
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify(req.body)
    });
 
    const data = await response.json();
 
    // Log para debugging
    console.log('GROQ STATUS:', response.status);
    if (!response.ok) {
      console.log('GROQ ERROR:', JSON.stringify(data));
    }
 
    res.status(response.status).json(data);
  } catch (err) {
    console.log('GROQ FETCH ERROR:', err.message);
    res.status(500).json({ error: { message: err.message } });
  }
}
 
