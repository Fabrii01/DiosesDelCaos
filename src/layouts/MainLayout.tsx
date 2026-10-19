import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { cerrarSesion } from "../services/authService";
import { 
  LayoutDashboard, 
  Package, 
  ArrowLeftRight, 
  Coins, 
  History, 
  Users, 
  LogOut 
} from "lucide-react";

const enlaces = [
  { to: "/", label: "Dashboard", end: true, icon: LayoutDashboard },
  { to: "/inventario", label: "Inventario", icon: Package },
  { to: "/movimientos", label: "Movimientos", icon: ArrowLeftRight },
  { to: "/tesoreria", label: "Tesorería", icon: Coins },
  { to: "/historial", label: "Historial", icon: History },
  { to: "/usuarios", label: "Usuarios", icon: Users },
];

export default function MainLayout() {
  const navegar = useNavigate();

  async function manejarCierreSesion() {
    try {
      await cerrarSesion();
      navegar("/login", { replace: true });
    } catch (error) {
      console.error("No se pudo cerrar la sesión:", error);
    }
  }

  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-100 font-sans overflow-hidden">
      {/* Sidebar Lateral */}
      <aside className="w-72 bg-neutral-900/90 border-r border-red-950 flex flex-col justify-between p-5 relative shadow-2xl z-20">
        <div className="space-y-6">
          {/* Emblem / Logo */}
          <div className="flex items-center space-x-3 pb-5 border-b border-red-900/40">
            <div className="w-11 h-11 bg-red-950 border-2 border-red-600 rounded-lg flex items-center justify-center font-black text-red-500 text-lg shadow-[0_0_15px_rgba(239,68,68,0.4)]">
              DC
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wider uppercase text-red-500 drop-shadow">
                Dioses del Caos
              </h2>
              <span className="text-xs text-neutral-400 font-semibold tracking-wide">
                TBC Anniversary
              </span>
            </div>
          </div>

          <div className="text-[10px] font-bold tracking-widest text-red-600 uppercase px-2">
            Gestión de Guerra
          </div>

          {/* Menú de Navegación */}
          <nav className="space-y-1">
            {enlaces.map((enlace) => {
              const Icono = enlace.icon;
              return (
                <NavLink
                  key={enlace.to}
                  to={enlace.to}
                  end={enlace.end}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-red-950/80 text-red-400 border border-red-800/60 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                        : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50"
                    }`
                  }
                >
                  <Icono size={20} className="flex-shrink-0" />
                  <span>{enlace.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Zona Inferior */}
        <div className="space-y-4 pt-4 border-t border-red-900/40">
          <div className="flex items-center space-x-3 bg-neutral-950/60 p-3 rounded-lg border border-red-950">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
            </span>
            <div className="text-xs">
              <strong className="block text-neutral-200 font-semibold">Guild Treasury</strong>
              <small className="text-neutral-500">Panel de administración</small>
            </div>
          </div>

          <button
            className="w-full flex items-center justify-center space-x-2 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/60 hover:border-red-600 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 group"
            onClick={manejarCierreSesion}
          >
            <LogOut size={18} className="text-red-500 group-hover:-translate-x-0.5 transition-transform" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-neutral-950">
        <header className="h-16 bg-neutral-900/50 border-b border-red-950 px-8 flex items-center justify-between">
          <span className="text-sm font-medium text-neutral-400">
            Administración del banco
          </span>
          <span className="text-xs font-bold px-3 py-1 bg-red-950 text-red-400 border border-red-800/50 rounded-full tracking-wide uppercase">
            TBC Anniversary
          </span>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}