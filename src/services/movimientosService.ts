
import {
  collection,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../firebase";

export type TipoMovimiento = "entrada" | "salida";

export type MotivoMovimiento =
  | "Compra"
  | "Raid"
  | "Venta"
  | "Entrega"
  | "Devolución"
  | "Otro";

export type NuevoMovimiento = {
  wowheadId: number;
  nombre: string;
  icono: string;
  calidad: number;
  tipo: TipoMovimiento;
  cantidad: number;
  motivo: MotivoMovimiento;
  observacion: string;
  miembroEntregaId?: string;
  miembroEntregaNombre?: string;
};

export async function registrarMovimiento(
  movimiento: NuevoMovimiento,
): Promise<void> {
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("Debes iniciar sesión para registrar movimientos.");
  }

  const referenciaUsuario = doc(db, "users", usuario.uid);
  const documentoUsuario = await getDoc(referenciaUsuario);

  if (!documentoUsuario.exists()) {
    throw new Error("No se encontró el perfil del usuario.");
  }

  const nombreUsuario = String(
    documentoUsuario.data().nombre ?? "",
  ).trim();

  if (!nombreUsuario) {
    throw new Error("Tu perfil no tiene un nombre configurado.");
  }

  if (
    !Number.isSafeInteger(movimiento.cantidad) ||
    movimiento.cantidad < 1
  ) {
    throw new Error("La cantidad debe ser un entero mayor que cero.");
  }

  if (
    !Number.isSafeInteger(movimiento.wowheadId) ||
    movimiento.wowheadId < 1
  ) {
    throw new Error("El objeto seleccionado no es válido.");
  }

  let miembroEntregaNombre = "";
  let miembroEntregaId = "";

  if (movimiento.tipo === "entrada") {
    miembroEntregaId = movimiento.miembroEntregaId?.trim() ?? "";

    if (!miembroEntregaId) {
      throw new Error("Selecciona quién entregó el objeto.");
    }

    const referenciaMiembro = doc(
      db,
      "guilds",
      "guildPrincipal",
      "miembros",
      miembroEntregaId,
    );

    const documentoMiembro = await getDoc(referenciaMiembro);

    if (!documentoMiembro.exists()) {
      throw new Error(
        "El miembro seleccionado ya no existe. Selecciónalo nuevamente.",
      );
    }

    miembroEntregaNombre = String(
      documentoMiembro.data().nick ?? "",
    ).trim();

    if (!miembroEntregaNombre) {
      throw new Error("El miembro seleccionado no tiene un nick válido.");
    }
  }

  const referenciaObjeto = doc(
    db,
    "guilds",
    "guildPrincipal",
    "inventario",
    String(movimiento.wowheadId),
  );

  const referenciaMovimiento = doc(
    collection(
      db,
      "guilds",
      "guildPrincipal",
      "movimientos",
    ),
  );

  await runTransaction(db, async (transaccion) => {
    const documentoObjeto = await transaccion.get(referenciaObjeto);

    const cantidadActual = documentoObjeto.exists()
      ? Number(documentoObjeto.data().cantidad ?? 0)
      : 0;

    if (
      !Number.isSafeInteger(cantidadActual) ||
      cantidadActual < 0
    ) {
      throw new Error("La cantidad actual del inventario no es válida.");
    }

    if (
      movimiento.tipo === "salida" &&
      !documentoObjeto.exists()
    ) {
      throw new Error("El objeto no existe en el inventario.");
    }

    if (
      movimiento.tipo === "salida" &&
      movimiento.cantidad > cantidadActual
    ) {
      throw new Error(
        `Cantidad insuficiente. Solo hay ${cantidadActual} unidades disponibles.`,
      );
    }

    const nuevaCantidad =
      movimiento.tipo === "entrada"
        ? cantidadActual + movimiento.cantidad
        : cantidadActual - movimiento.cantidad;

    if (!Number.isSafeInteger(nuevaCantidad)) {
      throw new Error("La cantidad resultante no es válida.");
    }

    if (documentoObjeto.exists()) {
      transaccion.update(referenciaObjeto, {
        cantidad: nuevaCantidad,
        actualizadoEn: serverTimestamp(),
      });
    } else {
      transaccion.set(referenciaObjeto, {
        wowheadId: movimiento.wowheadId,
        nombre: movimiento.nombre,
        icono: movimiento.icono,
        calidad: movimiento.calidad,
        cantidad: nuevaCantidad,
        actualizadoEn: serverTimestamp(),
      });
    }

    transaccion.set(referenciaMovimiento, {
      wowheadId: movimiento.wowheadId,
      nombre: movimiento.nombre,
      icono: movimiento.icono,
      tipo: movimiento.tipo,
      cantidad: movimiento.cantidad,
      cantidadAnterior: cantidadActual,
      cantidadResultante: nuevaCantidad,
      motivo: movimiento.motivo,
      observacion: movimiento.observacion.trim(),
      usuarioId: usuario.uid,
      usuarioEmail: usuario.email ?? "",
      usuarioNombre: nombreUsuario,
      miembroEntregaId,
      miembroEntregaNombre,
      fecha: serverTimestamp(),
    });
  });
}
