import { useEffect, useState } from "react";
import { escucharInventario, type ObjetoInventario } from "../services/inventarioService";
import { escucharMiembros, type MiembroGuild } from "../services/miembrosService";
import { escucharSaldoOro } from "../services/tesoreriaService";
import { Package, ShieldAlert, Swords, Users, Coins } from "lucide-react";

export default function Dashboard() {
  const [objetos, setObjetos] = useState<ObjetoInventario[]>([]);
  const [miembros, setMiembros] = useState<MiembroGuild[]>([]);
  const [saldoOro, setSaldoOro] = useState(0);

  const [inventarioCargado, setInventarioCargado] = useState(false);
  const [miembrosCargados, setMiembrosCargados] = useState(false);
  const [oroCargado, setOroCargado] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const cancelarInventario = escucharInventario(
      (lista) => { setObjetos(lista); setInventarioCargado(true); },
      (err) => { console.error(err); setError("No se pudo cargar el inventario."); setInventarioCargado(true); }
    );

    const cancelarMiembros = escucharMiembros(
      (lista) => { setMiembros(lista); setMiembrosCargados(true); },
      (err) => { console.error(err); setError("No se pudieron cargar los miembros de la guild."); setMiembrosCargados(true); }
    );

    const cancelarSaldo = escucharSaldoOro(
      (saldo) => { setSaldoOro(saldo); setOroCargado(true); },
      (err) => { console.error(err); setError("No se pudo cargar el saldo de tesorería."); setOroCargado(true); }
    );

    return () => {
      cancelarInventario();
      cancelarMiembros();
      cancelarSaldo();
    };
  }, []);

  const cargandoInventario = !inventarioCargado;
  const cargandoMiembros = !miembrosCargados;
  const cargandoOro = !oroCargado;

  const totalUnidades = objetos.reduce((acc, obj) => acc + obj.cantidad, 0);

  return (
    <section className="max-w-7xl mx-auto space-y-8 text-neutral-100">
      <div className="border-b border-red-900/40 pb-6 relative">
        <div className="absolute -top-3 left-0 w-24 h-1 bg-gradient-to-r from-red-600 to-transparent"></div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-wider text-red-500 uppercase drop-shadow-[0_2px_10px_rgba(239,68,68,0.3)]">
          Centro de Mando
        </h1>
        <p className="text-neutral-400 mt-2 text-sm md:text-base">
          Resumen táctico y estado actual de la hermandad <span className="text-red-400 font-semibold">Dioses del Caos</span>.
        </p>
      </div>

      {error && (
        <div className="bg-red-950/80 border-l-4 border-red-600 p-4 text-red-200 rounded-r-md shadow-lg flex items-center space-x-3" role="alert">
          <ShieldAlert size={24} className="text-red-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <article className="relative bg-neutral-900/90 border border-red-900/40 rounded-xl p-6 shadow-xl hover:border-red-600 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">Inventario</span>
            <div className="p-2 bg-red-950/80 border border-red-800/40 rounded-lg text-red-500">
              <Package size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-neutral-100 mb-1">
            {cargandoInventario ? <span className="animate-pulse text-red-500">...</span> : objetos.length.toLocaleString("en-US")}
          </div>
          <p className="text-xs text-neutral-400">Tipos de objetos registrados</p>
        </article>

        <article className="relative bg-neutral-900/90 border border-red-900/40 rounded-xl p-6 shadow-xl hover:border-red-600 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">Arsenal</span>
            <div className="p-2 bg-red-950/80 border border-red-800/40 rounded-lg text-red-500">
              <Swords size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-neutral-100 mb-1">
            {cargandoInventario ? <span className="animate-pulse text-red-500">...</span> : totalUnidades.toLocaleString("en-US")}
          </div>
          <p className="text-xs text-neutral-400">Total de unidades en stock</p>
        </article>

        <article className="relative bg-neutral-900/90 border border-red-900/40 rounded-xl p-6 shadow-xl hover:border-red-600 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">Huestes</span>
            <div className="p-2 bg-red-950/80 border border-red-800/40 rounded-lg text-red-500">
              <Users size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-neutral-100 mb-1">
            {cargandoMiembros ? <span className="animate-pulse text-red-500">...</span> : miembros.length.toLocaleString("en-US")}
          </div>
          <p className="text-xs text-neutral-400">Guerreros registrados</p>
        </article>

        <article className="relative bg-neutral-900/90 border border-amber-900/40 rounded-xl p-6 shadow-xl hover:border-amber-500 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">Tesorería</span>
            <div className="p-2 bg-amber-950/80 border border-amber-800/40 rounded-lg text-amber-400">
              <Coins size={20} />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-amber-400 mb-1 truncate">
            {cargandoOro ? <span className="animate-pulse text-amber-500">...</span> : `${saldoOro.toLocaleString("en-US")}g`}
          </div>
          <p className="text-xs text-neutral-400">Oro en arcas de la guild</p>
        </article>
      </div>
    </section>
  );
}