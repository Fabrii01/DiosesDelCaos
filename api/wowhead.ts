
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

  if (q.length < 2) {
    return res.status(400).json({ error: "Escribe al menos 2 caracteres." });
  }

  try {
    const url =
      `https://www.wowhead.com/search/suggestions-open-search?q=${encodeURIComponent(q)}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error("Respuesta de Wowhead:", response.status);
      return res.status(502).json({
        error: "Wowhead no pudo completar la búsqueda.",
        upstreamStatus: response.status,
      });
    }

    const data: unknown = await response.json();

    if (!Array.isArray(data) || !Array.isArray(data[1])) {
      return res.status(502).json({
        error: "Formato inesperado de Wowhead.",
      });
    }

    const results = data[1]
      .filter((name: unknown): name is string => typeof name === "string")
      .map((name: string) => ({ name }));

    return res.status(200).json({ results });
  } catch (error) {
    console.error("Error consultando Wowhead:", error);
    return res.status(502).json({
      error: "No se pudo consultar Wowhead.",
    });
  }
}
