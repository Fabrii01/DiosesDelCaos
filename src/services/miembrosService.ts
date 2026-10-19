import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";

import { db } from "../firebase";

export const clasesWoW = [
  "Warrior",
  "Paladin",
  "Hunter",
  "Rogue",
  "Priest",
  "Shaman",
  "Mage",
  "Warlock",
  "Druid",
] as const;

export type NuevoMiembro = {
  nick: string;
  clase: string;
  spec: string;
  gearscore: number;
  profesion?: string;
  discord?: boolean;
  whatsapp?: boolean;
  notas?: string;
};

export type MiembroGuild = NuevoMiembro & {
  id: string;
};

const referenciaMiembros = collection(
  db,
  "guilds",
  "guildPrincipal",
  "miembros",
);

function validarMiembro(miembro: NuevoMiembro): NuevoMiembro {
  const nick = miembro.nick.trim();
  const clase = miembro.clase.trim();
  const spec = miembro.spec.trim();
  const profesion = miembro.profesion?.trim() ?? "";
  const notas = miembro.notas?.trim() ?? "";

  if (!nick || !clase || !spec) {
    throw new Error("Completa el nick, la clase y la spec.");
  }

  if (nick.length > 50) {
    throw new Error("El nick no puede superar los 50 caracteres.");
  }

  if (spec.length > 40) {
    throw new Error("La spec no puede superar los 40 caracteres.");
  }

  if (profesion.length > 50) {
    throw new Error("La profesión no puede superar los 50 caracteres.");
  }

  if (notas.length > 200) {
    throw new Error("Las notas no pueden superar los 200 caracteres.");
  }

  if (
    !Number.isSafeInteger(miembro.gearscore) ||
    miembro.gearscore < 0
  ) {
    throw new Error(
      "El gearscore debe ser un entero igual o mayor que cero.",
    );
  }

  return {
    nick,
    clase,
    spec,
    gearscore: miembro.gearscore,
    profesion,
    discord: Boolean(miembro.discord),
    whatsapp: Boolean(miembro.whatsapp),
    notas,
  };
}

export async function registrarMiembro(
  miembro: NuevoMiembro,
): Promise<void> {
  const datos = validarMiembro(miembro);

  await addDoc(referenciaMiembros, {
    ...datos,
    creadoEn: serverTimestamp(),
  });
}

export async function actualizarMiembro(
  id: string,
  miembro: NuevoMiembro,
): Promise<void> {
  if (!id.trim()) {
    throw new Error("El miembro seleccionado no es válido.");
  }

  const datos = validarMiembro(miembro);
  const referenciaMiembro = doc(referenciaMiembros, id);

  await updateDoc(referenciaMiembro, {
    ...datos,
    actualizadoEn: serverTimestamp(),
  });
}

export function escucharMiembros(
  alActualizar: (miembros: MiembroGuild[]) => void,
  alFallar: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    referenciaMiembros,
    (instantanea) => {
      const miembros: MiembroGuild[] = instantanea.docs.map(
        (documento) => {
          const datos = documento.data();

          return {
            id: documento.id,
            nick: String(datos.nick ?? ""),
            clase: String(datos.clase ?? ""),
            spec: String(datos.spec ?? ""),
            gearscore: Number(datos.gearscore ?? 0),
            profesion: String(datos.profesion ?? ""),
            discord: Boolean(datos.discord ?? false),
            whatsapp: Boolean(datos.whatsapp ?? false),
            notas: String(datos.notas ?? ""),
          };
        },
      );

      miembros.sort((a, b) => a.nick.localeCompare(b.nick));
      alActualizar(miembros);
    },
    (error) => alFallar(error),
  );
}