import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  type Timestamp,
  type Unsubscribe,
} from "firebase/firestore";

import { auth, db } from "../firebase";
import type { ObjetoWowhead } from "./wowheadService";

export type TipoOperacionOro = "ingreso" | "gasto";

export type MovimientoOro = {
  id: string;
  tipo: TipoOperacionOro;
  cantidad: number;
  saldoAnterior: number;
  saldoResultante: number;
  motivo: string;
  observacion: string;
  objetoVendido?: string;
  objetoVendidoId?: number;
  objetoVendidoIcono?: string;
  objetoVendidoCalidad?: number;
  usuarioId: string;
  usuarioNombre: string;
  usuarioEmail: string;
  fecha: Timestamp | null;
};

const referenciaSaldo = doc(
  db,
  "guilds",
  "guildPrincipal",
  "tesoreria",
  "resumen",
);

const referenciaMovimientos = collection(
  db,
  "guilds",
  "guildPrincipal",
  "movimientosOro",
);

function validarOperacion(
  tipo: TipoOperacionOro,
  cantidad: number,
  motivo: string,
): void {
  if (tipo !== "ingreso" && tipo !== "gasto") {
    throw new Error("El tipo de operación no es válido.");
  }

  if (!Number.isSafeInteger(cantidad) || cantidad <= 0) {
    throw new Error(
      "La cantidad de oro debe ser un entero mayor que cero.",
    );
  }

  if (!motivo.trim()) {
    throw new Error("Debes indicar el motivo de la operación.");
  }

  if (motivo.trim().length > 150) {
    throw new Error("El motivo no puede superar los 150 caracteres.");
  }
}

export async function registrarOperacionOro(
  tipo: TipoOperacionOro,
  cantidad: number,
  motivo: string,
  observacion = "",
  objetoVendido = "",
  objetoSeleccionado?: ObjetoWowhead,
): Promise<void> {
  validarOperacion(tipo, cantidad, motivo);

  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error(
      "Debes iniciar sesión para registrar una operación.",
    );
  }

  if (observacion.trim().length > 500) {
    throw new Error(
      "La observación no puede superar los 500 caracteres.",
    );
  }

  if (objetoVendido.trim().length > 150) {
    throw new Error(
      "El nombre del objeto no puede superar los 150 caracteres.",
    );
  }

  if (
    objetoSeleccionado &&
    (!Number.isSafeInteger(objetoSeleccionado.id) ||
      objetoSeleccionado.id <= 0)
  ) {
    throw new Error("El objeto seleccionado no tiene un ID válido.");
  }

  const referenciaUsuario = doc(db, "users", usuario.uid);
  const perfil = await getDoc(referenciaUsuario);
  const datosUsuario = perfil.exists() ? perfil.data() : {};

  const usuarioNombre = String(
    datosUsuario.nombre ||
      usuario.displayName ||
      usuario.email ||
      "Usuario",
  );

  const referenciaMovimiento = doc(referenciaMovimientos);

  await runTransaction(db, async (transaccion) => {
    const documentoSaldo = await transaccion.get(referenciaSaldo);

    const saldoActual = documentoSaldo.exists()
      ? Number(documentoSaldo.data().saldo ?? 0)
      : 0;

    if (!Number.isSafeInteger(saldoActual) || saldoActual < 0) {
      throw new Error(
        "El saldo actual no es válido. Revisa los datos de tesorería.",
      );
    }

    if (tipo === "gasto" && cantidad > saldoActual) {
      throw new Error(
        "No hay suficiente oro disponible para este gasto.",
      );
    }

    const nuevoSaldo =
      tipo === "ingreso"
        ? saldoActual + cantidad
        : saldoActual - cantidad;

    if (!Number.isSafeInteger(nuevoSaldo)) {
      throw new Error(
        "La operación supera el límite de cantidad permitido.",
      );
    }

    transaccion.set(referenciaSaldo, {
      saldo: nuevoSaldo,
      actualizadoEn: serverTimestamp(),
      actualizadoPor: usuario.uid,
    });

    transaccion.set(referenciaMovimiento, {
      tipo,
      cantidad,
      saldoAnterior: saldoActual,
      saldoResultante: nuevoSaldo,
      motivo: motivo.trim(),
      observacion: observacion.trim(),

      // Datos del objeto seleccionado en WoWHead (disponibles para ingreso y gasto)
      objetoVendido: objetoSeleccionado?.nombre ?? objetoVendido.trim(),
      objetoVendidoId: objetoSeleccionado?.id ?? null,
      objetoVendidoIcono: objetoSeleccionado?.icono ?? "",
      objetoVendidoCalidad: objetoSeleccionado?.calidad ?? 0,

      usuarioId: usuario.uid,
      usuarioNombre,
      usuarioEmail: usuario.email ?? "",
      fecha: serverTimestamp(),
    });
  });
}

export function escucharSaldoOro(
  alActualizar: (saldo: number) => void,
  alFallar: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    referenciaSaldo,
    (documento) => {
      const saldo = documento.exists()
        ? Number(documento.data().saldo ?? 0)
        : 0;

      alActualizar(saldo);
    },
    (error) => alFallar(error),
  );
}

export function escucharMovimientosOro(
  alActualizar: (movimientos: MovimientoOro[]) => void,
  alFallar: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    referenciaMovimientos,
    (instantanea) => {
      const movimientos: MovimientoOro[] =
        instantanea.docs.map((documento) => {
          const datos = documento.data();

          return {
            id: documento.id,
            tipo: datos.tipo === "gasto" ? "gasto" : "ingreso",
            cantidad: Number(datos.cantidad ?? 0),
            saldoAnterior: Number(datos.saldoAnterior ?? 0),
            saldoResultante: Number(datos.saldoResultante ?? 0),
            motivo: String(datos.motivo ?? ""),
            observacion: String(datos.observacion ?? ""),
            objetoVendido: String(datos.objetoVendido ?? ""),

            objetoVendidoId:
              datos.objetoVendidoId != null
                ? Number(datos.objetoVendidoId)
                : undefined,

            objetoVendidoIcono: String(
              datos.objetoVendidoIcono ?? "",
            ),

            objetoVendidoCalidad: Number(
              datos.objetoVendidoCalidad ?? 0,
            ),

            usuarioId: String(datos.usuarioId ?? ""),
            usuarioNombre: String(datos.usuarioNombre ?? ""),
            usuarioEmail: String(datos.usuarioEmail ?? ""),
            fecha: datos.fecha ?? null,
          };
        });

      movimientos.sort((a, b) => {
        const fechaA = a.fecha?.toMillis() ?? 0;
        const fechaB = b.fecha?.toMillis() ?? 0;

        return fechaB - fechaA;
      });

      alActualizar(movimientos);
    },
    (error) => alFallar(error),
  );
}