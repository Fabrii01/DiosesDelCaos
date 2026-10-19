import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { iniciarSesion } from "../services/authService";
import { User, Lock, ShieldAlert, LogIn, Flame } from "lucide-react";

export default function Login() {
  const navegar = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function manejarInicioSesion(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError("");
    setCargando(true);

    try {
      await iniciarSesion(usuario.trim(), password);
      navegar("/", { replace: true });
    } catch (error: unknown) {
      console.error(error);
      const codigo = typeof error === "object" && error !== null && "code" in error ? error.code : "";

      if (
        codigo === "auth/invalid-credential" ||
        codigo === "auth/user-not-found" ||
        codigo === "auth/wrong-password"
      ) {
        setError("El usuario o la contraseña son incorrectos.");
      } else {
        setError("No se pudo iniciar sesión. Inténtalo nuevamente.");
      }
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="min-h-screen w-full bg-neutral-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <form
          className="bg-neutral-900/90 border border-red-900/50 rounded-2xl p-8 shadow-2xl backdrop-blur-md space-y-6 relative overflow-hidden"
          onSubmit={manejarInicioSesion}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>

          <div className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 bg-red-950 border-2 border-red-600 rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(239,68,68,0.4)]">
              <span className="font-black text-2xl text-red-500 tracking-wider">DC</span>
            </div>

            <div>
              <span className="text-[10px] font-bold tracking-[0.2em] text-red-500 uppercase flex items-center justify-center space-x-1">
                <Flame size={12} className="text-red-500 animate-pulse" />
                <span>GUILDTREASURY</span>
              </span>
              <h1 className="text-3xl font-black uppercase tracking-wide text-neutral-100 mt-1">
                Dioses del Caos
              </h1>
              <p className="text-xs text-neutral-400 mt-1 font-medium">
                Banco de guild · TBC Anniversary
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-950/80 border-l-4 border-red-600 p-3.5 rounded-r-lg text-xs text-red-200 flex items-center space-x-3 shadow-md" role="alert">
              <ShieldAlert size={18} className="text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="usuario" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Usuario
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-3 text-neutral-500" />
                <input
                  id="usuario"
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  autoComplete="username"
                  placeholder="Tu nombre de usuario"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-red-600 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-red-600 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-3 text-neutral-500" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-red-600 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-red-600 transition"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-red-950 hover:bg-red-900 border border-red-700 text-red-100 font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-xs"
          >
            {cargando ? (
              <span className="animate-pulse">Verificando...</span>
            ) : (
              <>
                <LogIn size={16} />
                <span>Ingresar al Banco</span>
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <Link to="/registro" className="text-xs text-neutral-400 hover:text-red-400 transition font-medium">
              ¿No tienes cuenta? Regístrate como Oficial
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}