
export type ObjetoWowhead = {
  id: number;
  nombre: string;
  icono: string;
  calidad: number;
};

export async function buscarObjetosWowhead(
  busqueda: string,
): Promise<ObjetoWowhead[]> {
  const termino = busqueda.trim();

  if (termino.length < 2) return [];

  const respuesta = await fetch(
    `/api/wowhead?q=${encodeURIComponent(termino)}`,
  );

  if (!respuesta.ok) {
    throw new Error(`Error en la búsqueda: HTTP ${respuesta.status}`);
  }

  const datos: { results?: { name: string }[] } =
    await respuesta.json();

  console.info("Sugerencias de Wowhead:", datos.results ?? []);

  // Las sugerencias contienen nombres, no IDs ni iconos.
  // No devolver objetos incompletos al selector.
  return [];
}
