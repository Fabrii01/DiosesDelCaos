
import {
  collection,
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";

import { db } from "../firebase";
import type { ObjetoWowhead } from "./wowheadService";

export type ObjetoInventario = ObjetoWowhead & {
  cantidad: number;
};

export async function guardarObjetoInventario(
  objeto: ObjetoWowhead,
  cantidad: number,
): Promise<void> {
  if (!Number.isSafeInteger(cantidad) || cantidad < 1) {
    throw new Error("La cantidad debe ser un entero mayor que cero.");
  }

  const referencia = doc(
    db,
    "guilds",
    "guildPrincipal",
    "inventario",
    String(objeto.id),
  );

  await runTransaction(db, async (transaccion) => {
    const documento = await transaccion.get(referencia);

    if (documento.exists()) {
      throw new Error(
        "Este objeto ya existe en el inventario. Usa Movimientos para modificar su stock.",
      );
    }

    transaccion.set(referencia, {
      wowheadId: objeto.id,
      nombre: objeto.nombre,
      icono: objeto.icono,
      calidad: objeto.calidad,
      cantidad,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    });
  });
}

export function escucharInventario(
  alActualizar: (objetos: ObjetoInventario[]) => void,
  alFallar: (error: Error) => void,
): Unsubscribe {
  const referencia = collection(
    db,
    "guilds",
    "guildPrincipal",
    "inventario",
  );

  return onSnapshot(
    referencia,
    (instantanea) => {
      const objetos: ObjetoInventario[] = instantanea.docs.map(
        (documento) => {
          const datos = documento.data();

          return {
            id: Number(datos.wowheadId ?? documento.id),
            nombre: String(datos.nombre ?? "Objeto desconocido"),
            icono: String(datos.icono ?? ""),
            calidad: Number(datos.calidad ?? 0),
            cantidad: Number(datos.cantidad ?? 0),
          };
        },
      );

      objetos.sort((a, b) => a.nombre.localeCompare(b.nombre));
      alActualizar(objetos);
    },
    (error) => alFallar(error),
  );
}
