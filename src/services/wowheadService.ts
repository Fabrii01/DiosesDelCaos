
export type ObjetoWowhead = {
  id: number;
  nombre: string;
  icono: string;
  calidad: number;
};

const ICONO_POR_DEFECTO =
  "https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg";

export async function buscarObjetosWowhead(
  busqueda: string,
): Promise<ObjetoWowhead[]> {
  const termino = busqueda.trim();

  if (termino.length < 2) return [];

  try {
    const url =
      `https://www.wowhead.com/search/suggestions-open-search?q=${encodeURIComponent(termino)}`;

    const respuesta = await fetch(url);

    if (!respuesta.ok) {
      throw new Error(`Wowhead respondió ${respuesta.status}`);
    }

    const datos: unknown = await respuesta.json();

    if (!Array.isArray(datos) || !Array.isArray(datos[1])) {
      throw new Error("Formato de sugerencias inesperado");
    }

    const nombres = (datos[1] as unknown[])
      .filter((nombre): nombre is string => typeof nombre === "string")
      .slice(0, 10);

    // Las sugerencias solo contienen nombres, no IDs ni iconos.
    // No inventamos esos datos ni devolvemos resultados incompletos.
    console.info("Sugerencias de Wowhead:", nombres);

    return [];
  } catch (error) {
    console.error("Error al buscar en Wowhead:", error);

    return [];
  }
}
