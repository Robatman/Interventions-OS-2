
// export default async function handler(req, res) {
//   if (req.method !== 'POST') {
//     return res.status(405).end();
//   }

//   const response = await fetch(
//     'https://api.groq.com/openai/v1/audio/transcriptions',
//     {
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
//         'Content-Type': req.headers['content-type']
//       },
//       body: req
//     }
//   );

//   const data = await response.json();

//   res.status(response.status).json(data);
// }
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const response = await fetch(
    'https://api.groq.com/openai/v1/audio/transcriptions',
    {
      method: 'POST',
      headers: {
        Authorization: 'Bearer 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',
        'Content-Type': req.headers['content-type']
      },
      body: req
    }
  );

  const data = await response.json();
  res.status(response.status).json(data);
}
