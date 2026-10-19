import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const q = req.query.q as string;

  if (!q || q.trim().length < 2) {
    return res.status(400).json({ results: [] });
  }

  try {
    const wowheadUrl = `https://www.wowhead.com/tbc/search?q=${encodeURIComponent(q)}&energeon=true`;
    
    const response = await fetch(wowheadUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Error al consultar Wowhead" });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}