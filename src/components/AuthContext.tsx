
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

type AuthContextValue = {
  user: User | null;
  cargando: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let version = 0;

    const cancelar = onAuthStateChanged(auth, (usuarioFirebase) => {
      const versionActual = ++version;

      async function verificarAcceso() {
        if (!usuarioFirebase) {
          setUser(null);
          setCargando(false);
          return;
        }

        setCargando(true);

        try {
          const referencia = doc(
            db,
            "guilds",
            "guildPrincipal",
            "config",
            "acceso",
          );

          const documento = await getDoc(referencia);

          if (versionActual !== version) return;

          if (!documento.exists()) {
            await signOut(auth);

            if (versionActual === version) {
              setUser(null);
            }

            return;
          }

          setUser(usuarioFirebase);
        } catch (error) {
          console.error("Error verificando permisos:", error);

          if (versionActual === version) {
            await signOut(auth);
            setUser(null);
          }
        } finally {
          if (versionActual === version) {
            setCargando(false);
          }
        }
      }

      void verificarAcceso();
    });

    return () => {
      version++;
      cancelar();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, cargando }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error("useAuth debe usarse dentro de AuthProvider.");
  }

  return contexto;
}
