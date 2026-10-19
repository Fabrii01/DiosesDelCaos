import { useEffect, useMemo, useState } from "react";
import {
  escucharInventario,
  type ObjetoInventario,
} from "../services/inventarioService";
import {
  Search,
  Filter,
  PackageCheck,
  PackageX,
  Boxes,
  ShieldAlert,
  ExternalLink,
  Layers,
} from "lucide-react";

type FiltroStock = "todos" | "disponibles" | "agotados";

export default function Inventario() {
  const [objetos, setObjetos] = useState<ObjetoInventario[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroStock, setFiltroStock] = useState<FiltroStock>("todos");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    return escucharInventario(
      (lista) => {
        setObjetos(lista);
        setError("");
        setCargando(false);
      },
      (error) => {
        console.error("Error leyendo el inventario:", error);
        setError(
          "No se pudo cargar el inventario. Comprueba tus permisos de Firestore.",
        );
        setCargando(false);
      },
    );
  }, []);

  const objetosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase();

    return objetos.filter((objeto) => {
      const coincideBusqueda =
        !termino ||
        objeto.nombre.toLocaleLowerCase().includes(termino) ||
        String(objeto.id).includes(termino);

      const coincideStock =
        filtroStock === "todos" ||
        (filtroStock === "disponibles" && objeto.cantidad > 0) ||
        (filtroStock === "agotados" && objeto.cantidad === 0);

      return coincideBusqueda && coincideStock;
    });
  }, [objetos, busqueda, filtroStock]);

  const unidadesTotales = objetos.reduce(
    (total, objeto) => total + objeto.cantidad,
    0,
  );

  const objetosDisponibles = objetos.filter(
    (objeto) => objeto.cantidad > 0,
  ).length;

  const objetosAgotados = objetos.filter(
    (objeto) => objeto.cantidad === 0,
  ).length;

  return (
    <section className="max-w-7xl mx-auto space-y-8 text-neutral-100">
      {/* Cabecera */}
      <div className="border-b border-red-900/40 pb-6 relative">
        <div className="absolute -top-3 left-0 w-24 h-1 bg-gradient-to-r from-red-600 to-transparent"></div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-wider text-red-500 uppercase drop-shadow-[0_2px_10px_rgba(239,68,68,0.3)]">
          Arsenal & Banco de Hermandad
        </h1>
        <p className="text-neutral-400 mt-2 text-sm md:text-base">
          Existencias del banco de <span className="text-red-400 font-semibold">Dioses del Caos</span>. Para ajustar existencias o registrar depósitos, dirígete a Movimientos.
        </p>
      </div>

      {/* Resumen de Objetos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900/90 border border-red-900/40 rounded-xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 uppercase font-semibold tracking-wider">Registrados</span>
            <strong className="block text-2xl font-black text-neutral-100 mt-0.5">{objetos.length}</strong>
          </div>
          <div className="p-2.5 bg-red-950/80 border border-red-800/40 rounded-lg text-red-500">
            <Boxes size={20} />
          </div>
        </div>

        <div className="bg-neutral-900/90 border border-red-900/40 rounded-xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 uppercase font-semibold tracking-wider">Unidades Totales</span>
            <strong className="block text-2xl font-black text-neutral-100 mt-0.5">{unidadesTotales.toLocaleString("en-US")}</strong>
          </div>
          <div className="p-2.5 bg-red-950/80 border border-red-800/40 rounded-lg text-red-500">
            <Layers size={20} />
          </div>
        </div>

        <div className="bg-neutral-900/90 border border-emerald-900/40 rounded-xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-400 uppercase font-semibold tracking-wider">En Stock</span>
            <strong className="block text-2xl font-black text-emerald-400 mt-0.5">{objetosDisponibles}</strong>
          </div>
          <div className="p-2.5 bg-emerald-950/80 border border-emerald-800/40 rounded-lg text-emerald-400">
            <PackageCheck size={20} />
          </div>
        </div>

        <div className="bg-neutral-900/90 border border-red-900/50 rounded-xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-red-400 uppercase font-semibold tracking-wider">Agotados</span>
            <strong className="block text-2xl font-black text-red-400 mt-0.5">{objetosAgotados}</strong>
          </div>
          <div className="p-2.5 bg-red-950/80 border border-red-800/50 rounded-lg text-red-400">
            <PackageX size={20} />
          </div>
        </div>
      </div>

      {/* Panel de Búsqueda y Tabla */}
      <div className="bg-neutral-900/70 border border-red-950 rounded-xl p-6 space-y-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-200">Consultar inventario</h2>
          <span className="text-xs text-neutral-500 font-mono">Actualizado en tiempo real</span>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label htmlFor="buscar-inventario" className="block text-xs font-semibold text-neutral-400 uppercase mb-2">
              Buscar objeto
            </label>
            <div className="relative">
              <Search size={18} className="absolute left-3.5 top-3 text-neutral-500" />
              <input
                id="buscar-inventario"
                type="search"
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
                placeholder="Nombre o ID de Wowhead..."
                className="w-full bg-neutral-950 border border-red-900/50 rounded-lg pl-10 pr-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              />
            </div>
          </div>

          <div className="relative">
            <label htmlFor="filtro-stock" className="block text-xs font-semibold text-neutral-400 uppercase mb-2">
              Estado del stock
            </label>
            <div className="relative">
              <Filter size={18} className="absolute left-3.5 top-3 text-neutral-500" />
              <select
                id="filtro-stock"
                value={filtroStock}
                onChange={(evento) =>
                  setFiltroStock(evento.target.value as FiltroStock)
                }
                className="w-full bg-neutral-950 border border-red-900/50 rounded-lg pl-10 pr-4 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition appearance-none"
              >
                <option value="todos">Todos los objetos</option>
                <option value="disponibles">Con stock disponible</option>
                <option value="agotados">Agotados</option>
              </select>
            </div>
          </div>
        </div>

        {cargando && (
          <p className="text-neutral-400 animate-pulse text-center py-12">
            Inspeccionando bóvedas del banco...
          </p>
        )}

        {error && (
          <div className="text-red-400 bg-red-950/60 p-4 rounded-lg border border-red-800/50 flex items-center space-x-3" role="alert">
            <ShieldAlert size={20} className="flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {!cargando && !error && objetosFiltrados.length === 0 && (
          <p className="text-neutral-400 text-center py-12 bg-neutral-950/40 rounded-lg border border-neutral-800">
            {objetos.length === 0
              ? "Todavía no hay objetos registrados en el banco."
              : "No se encontraron objetos con los términos de búsqueda ingresados."}
          </p>
        )}

        {!cargando && !error && objetosFiltrados.length > 0 && (
          <div className="overflow-x-auto border border-neutral-800 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-950 border-b border-red-950 text-xs font-semibold text-red-400 uppercase tracking-wider">
                  <th className="p-4">Objeto</th>
                  <th className="p-4">ID de Wowhead</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-sm font-medium">
                {objetosFiltrados.map((objeto) => (
                  <tr key={objeto.id} className="hover:bg-neutral-800/40 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative flex-shrink-0">
                          <img
                            src={objeto.icono}
                            alt=""
                            className="w-10 h-10 rounded border border-amber-900/60 shadow-md group-hover:border-amber-500 transition-colors object-cover"
                            onError={(e) => {
                              // Imagen fallback si la URL de icono falla
                              e.currentTarget.src = "https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg";
                            }}
                          />
                        </div>
                        <strong className="text-neutral-200 font-semibold group-hover:text-red-400 transition-colors">
                          {objeto.nombre}
                        </strong>
                      </div>
                    </td>

                    <td className="p-4">
                      <a
                        href={`https://www.wowhead.com/tbc/item=${objeto.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1 text-xs text-neutral-400 hover:text-amber-400 font-mono transition-colors"
                      >
                        <span>#{objeto.id}</span>
                        <ExternalLink size={12} />
                      </a>
                    </td>

                    <td className="p-4 font-mono font-bold text-neutral-100">
                      x{objeto.cantidad.toLocaleString("en-US")}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold tracking-wide border ${
                          objeto.cantidad > 0
                            ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/50"
                            : "bg-red-950/60 text-red-400 border-red-800/50"
                        }`}
                      >
                        {objeto.cantidad > 0 ? "Disponible" : "Agotado"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!cargando && !error && objetosFiltrados.length > 0 && (
          <p className="text-xs text-neutral-500 pt-2">
            Mostrando {objetosFiltrados.length} de {objetos.length} objetos registrados.
          </p>
        )}
      </div>
    </section>
  );
}