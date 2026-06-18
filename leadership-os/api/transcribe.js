export default async function handler(req, res) {
  const formData = new FormData();

  formData.append('file', req.file);
  formData.append('model', 'whisper-large-v3-turbo');
  formData.append('language', 'es');

  const response = await fetch(
    'https://api.groq.com/openai/v1/audio/transcriptions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: formData
    }
  );

  const data = await response.json();
  res.status(200).json(data);
}
