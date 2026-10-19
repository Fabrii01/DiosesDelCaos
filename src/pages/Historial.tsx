import { useEffect, useMemo, useState } from "react";
import {
  escucharHistorial,
  type MovimientoHistorial,
} from "../services/historialService";
import {
  escucharMovimientosOro,
  type MovimientoOro,
} from "../services/tesoreriaService";
import {
  ShieldAlert,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Coins,
  History as HistoryIcon,
  Package,
} from "lucide-react";

type TipoHistorial = "entrada" | "salida" | "ingreso" | "gasto";
type FiltroTipo = "todos" | TipoHistorial;

interface MovimientoVista {
  id: string;
  fecha: Date | null;
  nombre: string;
  icono: string;
  wowheadId: string;
  objetoVendido: string;
  tipo: TipoHistorial;
  cantidad: number;
  anterior: number;
  resultante: number;
  esOro: boolean;
  motivo: string;
  observacion: string;
  entregadoPor: string;
  responsable: string;
}

function convertirFecha(valor: unknown): Date | null {
  if (!valor) return null;

  if (valor instanceof Date) {
    return Number.isNaN(valor.getTime()) ? null : valor;
  }

  if (
    typeof valor === "object" &&
    valor !== null &&
    "toDate" in valor &&
    typeof valor.toDate === "function"
  ) {
    const fecha = valor.toDate() as Date;
    return Number.isNaN(fecha.getTime()) ? null : fecha;
  }

  if (typeof valor === "string" || typeof valor === "number") {
    const fecha = new Date(valor);
    return Number.isNaN(fecha.getTime()) ? null : fecha;
  }

  return null;
}

function formatearFecha(fecha: Date | null): string {
  if (!fecha) return "Sin fecha";

  return fecha.toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function obtenerTexto(
  datos: Record<string, unknown>,
  claves: string[],
): string {
  for (const clave of claves) {
    const valor = datos[clave];

    if (typeof valor === "string" && valor.trim()) {
      return valor;
    }

    if (typeof valor === "number") {
      return String(valor);
    }
  }

  return "—";
}

function obtenerNumero(
  datos: Record<string, unknown>,
  claves: string[],
): number {
  for (const clave of claves) {
    const valor = datos[clave];

    if (typeof valor === "number" && Number.isFinite(valor)) {
      return valor;
    }

    if (typeof valor === "string" && valor.trim() !== "") {
      const numero = Number(valor);

      if (Number.isFinite(numero)) {
        return numero;
      }
    }
  }

  return 0;
}

function convertirMovimientoInventario(
  movimiento: MovimientoHistorial,
): MovimientoVista {
  const datos = movimiento as unknown as Record<string, unknown>;

  const tipoOriginal = obtenerTexto(datos, [
    "tipo",
    "tipoMovimiento",
  ]).toLowerCase();

  const tipo: TipoHistorial =
    tipoOriginal === "salida" ? "salida" : "entrada";

  return {
    id: `inventario-${obtenerTexto(datos, ["id"])}`,
    fecha: convertirFecha(datos.fecha),
    nombre: obtenerTexto(datos, [
      "objetoNombre",
      "nombreObjeto",
      "nombre",
      "objeto",
    ]),
    icono: obtenerTexto(datos, ["icono", "objetoIcono"]),
    wowheadId: obtenerTexto(datos, ["wowheadId", "objetoId"]),
    objetoVendido: "",
    tipo,
    cantidad: obtenerNumero(datos, ["cantidad"]),
    anterior: obtenerNumero(datos, [
      "stockAnterior",
      "cantidadAnterior",
      "anterior",
    ]),
    resultante: obtenerNumero(datos, [
      "stockResultante",
      "cantidadResultante",
      "resultante",
    ]),
    esOro: false,
    motivo: obtenerTexto(datos, ["motivo", "razon"]),
    observacion: obtenerTexto(datos, [
      "observacion",
      "observaciones",
    ]),
    entregadoPor: obtenerTexto(datos, [
      "entregadoPor",
      "miembroEntregaNombre",
    ]),
    responsable: obtenerTexto(datos, [
      "responsable",
      "responsableNombre",
      "registradoPor",
      "usuarioNombre",
    ]),
  };
}

function convertirMovimientoOro(
  movimiento: MovimientoOro,
): MovimientoVista {
  const datos = movimiento as unknown as Record<string, unknown>;

  const tipoOriginal = obtenerTexto(datos, [
    "tipo",
    "tipoOperacion",
  ]).toLowerCase();

  const tipo: TipoHistorial =
    tipoOriginal === "gasto" || tipoOriginal === "egreso"
      ? "gasto"
      : "ingreso";

  const objetoVendido = obtenerTexto(datos, ["objetoVendido"]);

  const motivo = obtenerTexto(datos, [
    "motivo",
    "concepto",
    "descripcion",
  ]);

  return {
    id: `oro-${obtenerTexto(datos, ["id"])}`,
    fecha: convertirFecha(datos.fecha),
    nombre:
      objetoVendido !== "—"
        ? objetoVendido
        : obtenerTexto(datos, [
            "concepto",
            "nombre",
            "descripcion",
            "motivo",
          ]),
    icono: obtenerTexto(datos, ["objetoVendidoIcono"]),
    wowheadId: obtenerTexto(datos, ["objetoVendidoId"]),
    objetoVendido,
    tipo,
    cantidad: obtenerNumero(datos, ["cantidad", "oro"]),
    anterior: obtenerNumero(datos, [
      "saldoAnterior",
      "saldoPrevio",
      "anterior",
    ]),
    resultante: obtenerNumero(datos, [
      "saldoResultante",
      "saldoNuevo",
      "resultante",
    ]),
    esOro: true,
    motivo,
    observacion: obtenerTexto(datos, [
      "observacion",
      "observaciones",
    ]),
    entregadoPor: "—",
    responsable: obtenerTexto(datos, [
      "responsable",
      "registradoPor",
      "usuarioNombre",
    ]),
  };
}

function etiquetaTipo(tipo: TipoHistorial): string {
  switch (tipo) {
    case "entrada":
      return "Entrada de objeto";
    case "salida":
      return "Salida de objeto";
    case "ingreso":
      return "Ingreso de oro";
    case "gasto":
      return "Gasto de oro";
  }
}

export default function Historial() {
  const [movimientosInventario, setMovimientosInventario] = useState<
    MovimientoHistorial[]
  >([]);
  const [movimientosOro, setMovimientosOro] = useState<MovimientoOro[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>("todos");
  const [busqueda, setBusqueda] = useState("");
  const [inventarioCargado, setInventarioCargado] = useState(false);
  const [oroCargado, setOroCargado] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const cancelarInventario = escucharHistorial(
      (datos) => {
        setMovimientosInventario(datos);
        setInventarioCargado(true);
      },
      (errorInventario) => {
        console.error(
          "Error al cargar historial de inventario:",
          errorInventario,
        );
        setError("No se pudo cargar el historial del inventario.");
        setInventarioCargado(true);
      },
    );

    const cancelarOro = escucharMovimientosOro(
      (datos) => {
        setMovimientosOro(datos);
        setOroCargado(true);
      },
      (errorOro) => {
        console.error("Error al cargar historial de tesorería:", errorOro);
        setError("No se pudo cargar el historial de tesorería.");
        setOroCargado(true);
      },
    );

    return () => {
      cancelarInventario();
      cancelarOro();
    };
  }, []);

  const cargando = !inventarioCargado || !oroCargado;

  const todosLosMovimientos = useMemo(() => {
    return [
      ...movimientosInventario.map(convertirMovimientoInventario),
      ...movimientosOro.map(convertirMovimientoOro),
    ].sort((a, b) => {
      const fechaA = a.fecha?.getTime() ?? 0;
      const fechaB = b.fecha?.getTime() ?? 0;

      return fechaB - fechaA;
    });
  }, [movimientosInventario, movimientosOro]);

  const movimientosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return todosLosMovimientos.filter((movimiento) => {
      const coincideTipo =
        filtroTipo === "todos" || movimiento.tipo === filtroTipo;

      const contenido = [
        movimiento.nombre,
        movimiento.wowheadId,
        movimiento.objetoVendido,
        movimiento.motivo,
        movimiento.observacion,
        movimiento.entregadoPor,
        movimiento.responsable,
        etiquetaTipo(movimiento.tipo),
      ]
        .join(" ")
        .toLowerCase();

      return coincideTipo && (!texto || contenido.includes(texto));
    });
  }, [todosLosMovimientos, filtroTipo, busqueda]);

  const totalEntradas = movimientosInventario.filter((movimiento) => {
    const datos = movimiento as unknown as Record<string, unknown>;
    const tipo = obtenerTexto(datos, ["tipo", "tipoMovimiento"]).toLowerCase();

    return tipo === "entrada";
  }).length;

  const totalSalidas = movimientosInventario.filter((movimiento) => {
    const datos = movimiento as unknown as Record<string, unknown>;
    const tipo = obtenerTexto(datos, ["tipo", "tipoMovimiento"]).toLowerCase();

    return tipo === "salida";
  }).length;

  const totalIngresosOro = movimientosOro.filter(
    (movimiento) => movimiento.tipo === "ingreso",
  ).length;

  const totalGastosOro = movimientosOro.filter(
    (movimiento) => movimiento.tipo === "gasto",
  ).length;

  return (
    <section className="max-w-7xl mx-auto space-y-8 text-neutral-100">
      {/* Cabecera */}
      <div className="border-b border-red-900/40 pb-6 relative">
        <div className="absolute -top-3 left-0 w-24 h-1 bg-gradient-to-r from-red-600 to-transparent"></div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-wider text-red-500 uppercase drop-shadow-[0_2px_10px_rgba(239,68,68,0.3)]">
          Historial de Guerra
        </h1>
        <p className="text-neutral-400 mt-2 text-sm md:text-base">
          Bitácora completa de entradas, salidas y tesorería de <span className="text-red-400 font-semibold">Dioses del Caos</span>.
        </p>
      </div>

      {/* Alerta de Error */}
      {error && (
        <div className="bg-red-950/80 border-l-4 border-red-600 p-4 text-red-200 rounded-r-md shadow-lg flex items-center space-x-3" role="alert">
          <ShieldAlert size={22} className="text-red-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-neutral-900/80 border border-red-900/30 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Operaciones</span>
            <HistoryIcon size={16} className="text-neutral-500" />
          </div>
          <strong className="block text-2xl font-black text-neutral-100">
            {cargando ? "..." : todosLosMovimientos.length}
          </strong>
        </div>

        <div className="bg-neutral-900/80 border border-emerald-900/40 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Entradas</span>
            <ArrowDownLeft size={16} />
          </div>
          <strong className="block text-2xl font-black text-emerald-400">
            {cargando ? "..." : totalEntradas}
          </strong>
        </div>

        <div className="bg-neutral-900/80 border border-red-900/40 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between text-red-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Salidas</span>
            <ArrowUpRight size={16} />
          </div>
          <strong className="block text-2xl font-black text-red-400">
            {cargando ? "..." : totalSalidas}
          </strong>
        </div>

        <div className="bg-neutral-900/80 border border-amber-900/40 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Ingresos Oro</span>
            <Coins size={16} />
          </div>
          <strong className="block text-2xl font-black text-amber-400">
            {cargando ? "..." : totalIngresosOro}
          </strong>
        </div>

        <div className="bg-neutral-900/80 border border-rose-900/40 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between text-rose-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Gastos Oro</span>
            <Coins size={16} />
          </div>
          <strong className="block text-2xl font-black text-rose-400">
            {cargando ? "..." : totalGastosOro}
          </strong>
        </div>
      </div>

      {/* Panel de Filtros y Tabla */}
      <div className="bg-neutral-900/70 border border-red-950 rounded-xl p-6 space-y-6 shadow-xl">
        {/* Barra de Búsqueda y Selección */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search size={18} className="absolute left-3.5 top-3 text-neutral-500" />
            <input
              type="search"
              value={busqueda}
              placeholder="Buscar por objeto, concepto o responsable..."
              onChange={(evento) => setBusqueda(evento.target.value)}
              className="w-full bg-neutral-950 border border-red-900/50 rounded-lg pl-10 pr-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              aria-label="Buscar en el historial"
            />
          </div>

          <div className="relative">
            <Filter size={18} className="absolute left-3.5 top-3 text-neutral-500" />
            <select
              value={filtroTipo}
              onChange={(evento) => setFiltroTipo(evento.target.value as FiltroTipo)}
              className="w-full bg-neutral-950 border border-red-900/50 rounded-lg pl-10 pr-4 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition appearance-none"
              aria-label="Filtrar por tipo de operación"
            >
              <option value="todos">Todas las operaciones</option>
              <option value="entrada">Entradas de inventario</option>
              <option value="salida">Salidas de inventario</option>
              <option value="ingreso">Ingresos de oro</option>
              <option value="gasto">Gastos de oro</option>
            </select>
          </div>
        </div>

        {cargando ? (
          <p className="text-neutral-400 text-center py-12 animate-pulse">
            Cargando bitácora de guerra...
          </p>
        ) : movimientosFiltrados.length === 0 ? (
          <div className="text-center py-12 space-y-3 bg-neutral-950/40 rounded-lg border border-neutral-800">
            <Package size={40} className="mx-auto text-neutral-600" />
            <h2 className="text-lg font-bold text-neutral-300">No se encontraron movimientos</h2>
            <p className="text-xs text-neutral-500">Prueba ajustando la búsqueda o cambiando el filtro seleccionado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-neutral-800 rounded-lg">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-neutral-950 border-b border-red-950 text-xs font-semibold text-red-400 uppercase tracking-wider">
                  <th className="p-3.5">Fecha</th>
                  <th className="p-3.5">Objeto / Concepto</th>
                  <th className="p-3.5">Tipo</th>
                  <th className="p-3.5">Cantidad</th>
                  <th className="p-3.5">Previo</th>
                  <th className="p-3.5">Resultante</th>
                  <th className="p-3.5">Motivo / Observación</th>
                  <th className="p-3.5">Entregado por</th>
                  <th className="p-3.5">Responsable</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-800/60 font-medium">
                {movimientosFiltrados.map((movimiento) => {
                  const esPositivo =
                    movimiento.tipo === "entrada" ||
                    movimiento.tipo === "ingreso";

                  return (
                    <tr key={movimiento.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="p-3.5 text-xs text-neutral-400 font-mono whitespace-nowrap">
                        {formatearFecha(movimiento.fecha)}
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center space-x-2.5">
                          {movimiento.icono && movimiento.icono !== "—" && (
                            <img
                              src={movimiento.icono}
                              alt=""
                              className="w-8 h-8 rounded border border-neutral-700 object-cover flex-shrink-0"
                              loading="lazy"
                              onError={(evento) => {
                                evento.currentTarget.style.display = "none";
                              }}
                            />
                          )}
                          <span className="text-neutral-200 font-semibold">{movimiento.nombre}</span>
                        </div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${
                            esPositivo
                              ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/50"
                              : "bg-red-950/60 text-red-400 border-red-800/50"
                          }`}
                        >
                          {etiquetaTipo(movimiento.tipo)}
                        </span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap font-mono font-bold">
                        <span className={esPositivo ? "text-emerald-400" : "text-red-400"}>
                          {esPositivo ? "+" : "-"}
                          {movimiento.cantidad.toLocaleString("en-US")}
                          {movimiento.esOro ? "g" : ""}
                        </span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap text-xs text-neutral-400 font-mono">
                        {movimiento.anterior.toLocaleString("en-US")}
                        {movimiento.esOro ? "g" : ""}
                      </td>

                      <td className="p-3.5 whitespace-nowrap text-xs text-neutral-200 font-mono font-bold">
                        {movimiento.resultante.toLocaleString("en-US")}
                        {movimiento.esOro ? "g" : ""}
                      </td>

                      <td className="p-3.5 text-xs">
                        <div className="text-neutral-300">{movimiento.motivo}</div>
                        {movimiento.observacion !== "—" && (
                          <div className="text-neutral-500 italic mt-0.5">{movimiento.observacion}</div>
                        )}
                      </td>

                      <td className="p-3.5 text-xs text-neutral-400 whitespace-nowrap">
                        {movimiento.entregadoPor}
                      </td>

                      <td className="p-3.5 text-xs text-neutral-300 font-semibold whitespace-nowrap">
                        {movimiento.responsable}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}