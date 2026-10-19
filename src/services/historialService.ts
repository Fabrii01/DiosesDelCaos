import {
  collection,
  onSnapshot,
  orderBy,
  query,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../firebase";

export interface MovimientoHistorial {
  id: string;
  wowheadId: string;
  nombre: string;
  icono: string;
  tipo: "entrada" | "salida";
  cantidad: number;
  cantidadAnterior: number;
  cantidadResultante: number;
  motivo: string;
  observacion: string;
  usuarioId: string;
  usuarioNombre: string;
  usuarioEmail: string;
  miembroEntregaId: string;
  miembroEntregaNombre: string;
  fecha: import("firebase/firestore").Timestamp | null;
}

export function escucharHistorial(
  alActualizar: (movimientos: MovimientoHistorial[]) => void,
  alFallar: (error: Error) => void
): Unsubscribe {
  const referencia = collection(
    db,
    "guilds",
    "guildPrincipal",
    "movimientos"
  );

  const consulta = query(referencia, orderBy("fecha", "desc"));

  return onSnapshot(
    consulta,
    (snapshot) => {
      const movimientos: MovimientoHistorial[] = snapshot.docs.map(
        (documento) => {
          const datos = documento.data();

          return {
            id: documento.id,
            wowheadId: String(datos.wowheadId ?? ""),
            nombre: String(datos.nombre ?? ""),
            icono: String(datos.icono ?? ""),
            tipo: datos.tipo === "salida" ? "salida" : "entrada",
            cantidad: Number(datos.cantidad ?? 0),
            cantidadAnterior: Number(datos.cantidadAnterior ?? 0),
            cantidadResultante: Number(datos.cantidadResultante ?? 0),
            motivo: String(datos.motivo ?? ""),
            observacion: String(datos.observacion ?? ""),
            usuarioId: String(datos.usuarioId ?? ""),
            usuarioNombre: String(datos.usuarioNombre ?? ""),
            usuarioEmail: String(datos.usuarioEmail ?? ""),
            miembroEntregaId: String(datos.miembroEntregaId ?? ""),
            miembroEntregaNombre: String(
              datos.miembroEntregaNombre ?? ""
            ),
            fecha: datos.fecha ?? null,
          };
        }
      );

      alActualizar(movimientos);
    },
    (error) => {
      alFallar(error);
    }
  );
}