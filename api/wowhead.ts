
import type { VercelRequest, VercelResponse } from "@vercel/node";

type ResultadoWowhead = {
  type?: number;
  id?: number;
  name?: string;
  typeName?: string;
  icon?: string;
  quality?: number;
};

type RespuestaWowhead = {
  results?: ResultadoWowhead[];
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  const q =
    typeof req.query.q === "string" ? req.query.q.trim() : "";

  if (q.length < 2) {
    return res.status(400).json({
      error: "Escribe al menos 2 caracteres.",
    });
  }

  try {
    const url =
      `https://www.wowhead.com/search/suggestions-template?q=${encodeURIComponent(q)}`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!response.ok) {
      console.error("Wowhead respondió:", response.status);

      return res.status(502).json({
        error: "Wowhead no pudo completar la búsqueda.",
        upstreamStatus: response.status,
      });
    }

    const data = (await response.json()) as RespuestaWowhead;

    const results = (data.results ?? [])
      .filter(
        (item) =>
          item.type === 3 &&
          item.typeName === "Item" &&
          typeof item.id === "number" &&
          item.id > 0 &&
          typeof item.name === "string" &&
          Boolean(item.icon),
      )
      .map((item) => ({
        type: item.type,
        typeName: item.typeName,
        id: item.id!,
        name: item.name!,
        icon: item.icon!,
        quality: item.quality ?? 0,
      }));

    return res.status(200).json({
      search: q,
      results,
    });
  } catch (error) {
    console.error("Error consultando Wowhead:", error);

    return res.status(502).json({
      error: "No se pudo consultar Wowhead.",
    });
  }
}
