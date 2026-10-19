
export type ObjetoWowhead = {
  id: number;
  nombre: string;
  icono: string;
  calidad: number;
};

type ResultadoWowhead = {
  type: number;
  id: number;
  name: string;
  typeName: string;
  icon?: string;
  quality?: number;
};

type RespuestaWowhead = {
  results?: ResultadoWowhead[];
};

export async function buscarObjetosWowhead(
  busqueda: string,
): Promise<ObjetoWowhead[]> {
  const termino = busqueda.trim();

  if (termino.length < 2) {
    return [];
  }

  const url =
  "/api/wowhead?q=" + encodeURIComponent(termino);

  const respuesta = await fetch(url);

  if (!respuesta.ok) {
    throw new Error("No se pudo consultar Wowhead.");
  }

  const datos: RespuestaWowhead = await respuesta.json();

  return (datos.results ?? [])
    .filter(
      (resultado) =>
        resultado.typeName === "Item" &&
        resultado.type === 3 &&
        resultado.id > 0 &&
        Boolean(resultado.name) &&
        Boolean(resultado.icon),
    )
    .map((resultado) => ({
      id: resultado.id,
      nombre: resultado.name,
      icono:
        `https://wow.zamimg.com/images/wow/icons/large/` +
        `${resultado.icon}.jpg`,
      calidad: resultado.quality ?? 0,
    }));
}
