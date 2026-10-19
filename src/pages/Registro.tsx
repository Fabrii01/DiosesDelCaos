import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registrarOficial } from "../services/authService";
import { User, Lock, ShieldAlert, ShieldCheck, UserPlus, Flame } from "lucide-react";

export default function Registro() {
  const navegar = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function manejarRegistro(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError("");

    if (password !== confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);

    try {
      await registrarOficial(usuario.trim(), password);
      navegar("/", { replace: true });
    } catch (err: unknown) {
      console.error(err);
      const codigo = typeof err === "object" && err !== null && "code" in err ? err.code : "";

      if (codigo === "auth/email-already-in-use") {
        setError("Ese nombre de usuario ya se encuentra registrado.");
      } else if (codigo === "auth/weak-password") {
        setError("La contraseña debe tener al menos 6 caracteres.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("No se pudo completar el registro. Inténtalo de nuevo.");
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
          onSubmit={manejarRegistro}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>

          <div className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 bg-red-950 border-2 border-red-600 rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(239,68,68,0.4)]">
              <span className="font-black text-2xl text-red-500 tracking-wider">DC</span>
            </div>

            <div>
              <span className="text-[10px] font-bold tracking-[0.2em] text-red-500 uppercase flex items-center justify-center space-x-1">
                <Flame size={12} className="text-red-500 animate-pulse" />
                <span>NUEVO OFICIAL</span>
              </span>
              <h1 className="text-3xl font-black uppercase tracking-wide text-neutral-100 mt-1">
                Dioses del Caos
              </h1>
              <p className="text-xs text-neutral-400 mt-1 font-medium">
                Registro de acceso al Banco y Tesorería
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
                Usuario del Oficial
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-3 text-neutral-500" />
                <input
                  id="usuario"
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="Ej. Haaland"
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
                  placeholder="••••••••••••"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-red-600 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-red-600 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmarPassword" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <ShieldCheck size={18} className="absolute left-3.5 top-3 text-neutral-500" />
                <input
                  id="confirmarPassword"
                  type="password"
                  value={confirmarPassword}
                  onChange={(e) => setConfirmarPassword(e.target.value)}
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
              <span className="animate-pulse">Registrando usuario...</span>
            ) : (
              <>
                <UserPlus size={16} />
                <span>Registrar Oficial</span>
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <Link to="/login" className="text-xs text-neutral-400 hover:text-red-400 transition font-medium">
              ¿Ya tienes cuenta? Inicia sesión aquí
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}