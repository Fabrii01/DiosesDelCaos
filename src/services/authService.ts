import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const DOMINIO_GUILD = "diosesdelcaos.com";

// Convierte "test" en "test@diosesdelcaos.com"
function formatearCredencial(usuarioOCorreo: string): string {
  const texto = usuarioOCorreo.trim().toLowerCase();
  if (texto.includes("@")) {
    return texto;
  }
  return `${texto}@${DOMINIO_GUILD}`;
}

export async function registrarOficial(
  nombreUsuario: string,
  clave: string,
) {
  const usuarioLimpio = nombreUsuario.trim();
  
  if (!usuarioLimpio || usuarioLimpio.length < 3) {
    throw new Error("El nombre de usuario debe tener al menos 3 caracteres.");
  }

  if (clave.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres.");
  }

  const emailInterno = formatearCredencial(usuarioLimpio);

  // 1. Crear en Firebase Auth
  const credencial = await createUserWithEmailAndPassword(auth, emailInterno, clave);
  const user = credencial.user;

  // 2. Asignar displayName
  await updateProfile(user, {
    displayName: usuarioLimpio,
  });

  // 3. Crear documento usando 'role' para que coincida exactamente con tu usuario funcional
  const refUsuario = doc(db, "users", user.uid);
  await setDoc(refUsuario, {
    uid: user.uid,
    nombre: usuarioLimpio,
    usuario: usuarioLimpio,
    email: emailInterno,
    role: "tesorero", // Coincide con tu regla de Firestore y tu usuario funcional
    activo: true,
    creadoEn: new Date(),
  });

  return user;
}

export async function iniciarSesion(
  usuarioOCorreo: string,
  password: string,
) {
  const credencial = formatearCredencial(usuarioOCorreo);
  
  // Autenticar en Firebase Auth
  const credenciales = await signInWithEmailAndPassword(
    auth,
    credencial,
    password,
  );

  const uid = credenciales.user.uid;

  try {
    // Verificar si el usuario está registrado y activo en Firestore (users/uid)
    const refUsuario = doc(db, "users", uid);
    const docUsuario = await getDoc(refUsuario);

    if (docUsuario.exists()) {
      const datos = docUsuario.data();
      // Si el campo activo existe y es false, bloquear acceso
      if (datos.activo === false) {
        throw new Error("TU_USUARIO_ESTA_INACTIVO");
      }
    } else {
      // Si el documento en users no existía (ej. creado desde la consola de Auth), lo creamos automático
      const usuarioNombre = credenciales.user.displayName || usuarioOCorreo.split("@")[0];
      await setDoc(refUsuario, {
        uid,
        nombre: usuarioNombre,
        usuario: usuarioNombre,
        email: credenciales.user.email,
        role: "tesorero",
        activo: true,
      });
    }

    return credenciales.user;
  } catch (error) {
    // Solo si hay un error real de permisos/inactivo cerramos sesión
    await signOut(auth);
    throw error;
  }
}

export async function cerrarSesion() {
  await signOut(auth);
}