export type ObjetoWowhead = {
  id: number;
  nombre: string;
  icono: string;
  calidad: number;
};

type ItemWowheadAPI = {
  id: number;
  name: string;
  icon?: string;
  quality?: number;
};

export async function buscarObjetosWowhead(
  busqueda: string
): Promise<ObjetoWowhead[]> {
  const termino = busqueda.trim();

  if (termino.length < 2) {
    return [];
  }

  try {
    // ¡Asegúrate de incluir https:// al inicio para que el navegador no lo busque en Vercel!
    const url = `https://nether.wowhead.com/tooltip/search?q=${encodeURIComponent(termino)}`;

    const respuesta = await fetch(url);

    if (!respuesta.ok) {
      throw new Error("No se pudo consultar la API de objetos.");
    }

    const datos = await respuesta.json();
    
    const listaItems: ItemWowheadAPI[] = datos.results || datos.items || (Array.isArray(datos) ? datos : []);

    return listaItems
      .filter((item) => item.id && item.name)
      .map((item) => ({
        id: item.id,
        nombre: item.name,
        icono: item.icon
          ? `https://wow.zamimg.com/images/wow/icons/large/${item.icon}.jpg`
          : "https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg",
        calidad: item.quality ?? 2,
      }));
  } catch (error) {
    console.warn("Fallback de búsqueda:", error);
    
    // Si por algo falla, permite buscar o registrar escribiendo el ID numérico exacto
    if (/^\d+$/.test(termino)) {
      const idNum = parseInt(termino, 10);
      return [
        {
          id: idNum,
          nombre: `Objeto #${idNum}`,
          icono: "https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg",
          calidad: 3,
        },
      ];
    }
    return [];
  }
}