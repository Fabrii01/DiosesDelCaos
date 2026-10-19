import { useEffect, useState } from "react";
import {
  buscarObjetosWowhead,
  type ObjetoWowhead,
} from "../services/wowheadService";
import {
  registrarMovimiento,
  type TipoMovimiento,
  type MotivoMovimiento,
} from "../services/movimientosService";
import {
  escucharInventario,
  type ObjetoInventario,
} from "../services/inventarioService";
import {
  escucharMiembros,
  type MiembroGuild,
} from "../services/miembrosService";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  ShieldAlert,
  CheckCircle2,
  Package,
  Layers,
  User,
  FileText,
  Send,
} from "lucide-react";

const MOTIVOS: MotivoMovimiento[] = [
  "Compra",
  "Raid",
  "Venta",
  "Entrega",
  "Devolución",
  "Otro",
];

export default function Movimientos() {
  const [tipo, setTipo] = useState<TipoMovimiento>("entrada");
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState<ObjetoWowhead[]>([]);
  const [objeto, setObjeto] = useState<ObjetoWowhead | null>(null);
  const [inventario, setInventario] = useState<ObjetoInventario[]>([]);
  const [miembros, setMiembros] = useState<MiembroGuild[]>([]);
  const [miembroEntregaId, setMiembroEntregaId] = useState("");
  const [cantidad, setCantidad] = useState("1");
  const [motivo, setMotivo] = useState<MotivoMovimiento>("Raid");
  const [observacion, setObservacion] = useState("");
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const cancelarInventario = escucharInventario(
      (datos) => {
        setInventario(datos);
      },
      (error) => {
        console.error("Error al cargar inventario:", error);
        setError("No se pudo cargar el inventario.");
      }
    );

    const cancelarMiembros = escucharMiembros(
      (datos) => {
        setMiembros(datos);
      },
      (error) => {
        console.error("Error al cargar miembros:", error);
        setError("No se pudo cargar la lista de miembros.");
      }
    );

    return () => {
      cancelarInventario();
      cancelarMiembros();
    };
  }, []);

  useEffect(() => {
    if (tipo !== "entrada") {
      setResultados([]);
      setCargando(false);
      return;
    }

    if (objeto !== null) {
      setResultados([]);
      setCargando(false);
      return;
    }

    const texto = busqueda.trim();

    if (texto.length < 2) {
      setResultados([]);
      setCargando(false);
      return;
    }

    let cancelado = false;

    const temporizador = setTimeout(async () => {
      setCargando(true);

      try {
        const datos = await buscarObjetosWowhead(texto);

        if (!cancelado) {
          setResultados(datos);
        }
      } catch (error) {
        if (!cancelado) {
          console.error("Error al buscar objetos:", error);
          setResultados([]);
          setError("No se pudieron buscar objetos en Wowhead.");
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }, 400);

    return () => {
      cancelarId: cancelado = true;
      clearTimeout(temporizador);
    };
  }, [busqueda, tipo, objeto]);

  const objetoDisponible = objeto
    ? inventario.find((item) => item.id === objeto.id)
    : undefined;

  const miembrosActivos = miembros;

  function seleccionarObjeto(seleccionado: ObjetoWowhead) {
    setObjeto(seleccionado);
    setBusqueda(seleccionado.nombre);
    setResultados([]);
    setError("");
    setMensaje("");
  }

  function cambiarTipo(nuevoTipo: TipoMovimiento) {
    setTipo(nuevoTipo);
    setBusqueda("");
    setResultados([]);
    setObjeto(null);
    setCantidad("1");
    setMotivo("Raid");
    setObservacion("");
    setMiembroEntregaId("");
    setError("");
    setMensaje("");
  }

  async function guardar() {
    setError("");
    setMensaje("");

    if (!objeto) {
      setError("Selecciona un objeto antes de registrar el movimiento.");
      return;
    }

    const cantidadNumerica = Number(cantidad);

    if (
      !Number.isInteger(cantidadNumerica) ||
      cantidadNumerica <= 0
    ) {
      setError("La cantidad debe ser un número entero mayor que cero.");
      return;
    }

    if (
      tipo === "salida" &&
      (!objetoDisponible ||
        objetoDisponible.cantidad < cantidadNumerica)
    ) {
      setError("No hay suficientes unidades disponibles de este objeto.");
      return;
    }

    const miembroEntrega =
      tipo === "entrada"
        ? miembrosActivos.find((miembro) => miembro.id === miembroEntregaId)
        : undefined;

    if (tipo === "entrada" && !miembroEntrega) {
      setError("Selecciona el miembro que entrega el objeto.");
      return;
    }

    setGuardando(true);

    try {
      await registrarMovimiento({
        wowheadId: objeto.id,
        nombre: objeto.nombre,
        icono: objeto.icono,
        calidad: objeto.calidad,
        tipo,
        cantidad: cantidadNumerica,
        motivo,
        observacion: observacion.trim(),
        miembroEntregaId:
          tipo === "entrada" && miembroEntrega ? miembroEntrega.id : "",
        miembroEntregaNombre:
          tipo === "entrada" && miembroEntrega ? miembroEntrega.nick : "",
      });

      setMensaje(
        tipo === "entrada"
          ? "Entrada registrada correctamente."
          : "Salida registrada correctamente."
      );

      setBusqueda("");
      setResultados([]);
      setObjeto(null);
      setCantidad("1");
      setMotivo("Raid");
      setObservacion("");
      setMiembroEntregaId("");
    } catch (error) {
      console.error("Error al registrar movimiento:", error);
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo registrar el movimiento."
      );
    } finally {
      setGuardando(false);
    }
  }

  const objetosDisponibles = inventario.filter(
    (item) => item.cantidad > 0
  );

  return (
    <section className="max-w-4xl mx-auto space-y-8 text-neutral-100">
      {/* Cabecera */}
      <div className="border-b border-red-900/40 pb-6 relative">
        <div className="absolute -top-3 left-0 w-24 h-1 bg-gradient-to-r from-red-600 to-transparent"></div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-wider text-red-500 uppercase drop-shadow-[0_2px_10px_rgba(239,68,68,0.3)]">
          Registro de Movimientos
        </h1>
        <p className="text-neutral-400 mt-2 text-sm md:text-base">
          Gestiona las entradas de suministros y salidas de equipo para los miembros de <span className="text-red-400 font-semibold">Dioses del Caos</span>.
        </p>
      </div>

      {/* Contenedor Principal */}
      <div className="bg-neutral-900/80 border border-red-950 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
        
        {/* Selector de Tipo (Entrada / Salida) */}
        <div className="grid grid-cols-2 gap-4 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800">
          <button
            type="button"
            className={`flex items-center justify-center space-x-2 py-3 rounded-lg font-bold text-sm tracking-wide transition-all ${
              tipo === "entrada"
                ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60 shadow-md"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
            aria-pressed={tipo === "entrada"}
            onClick={() => cambiarTipo("entrada")}
          >
            <ArrowDownLeft size={18} />
            <span>Entrada de Suministros</span>
          </button>

          <button
            type="button"
            className={`flex items-center justify-center space-x-2 py-3 rounded-lg font-bold text-sm tracking-wide transition-all ${
              tipo === "salida"
                ? "bg-red-950 text-red-400 border border-red-800/60 shadow-md"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
            aria-pressed={tipo === "salida"}
            onClick={() => cambiarTipo("salida")}
          >
            <ArrowUpRight size={18} />
            <span>Salida / Retirada</span>
          </button>
        </div>

        {/* Panel de Selección de Objeto */}
        <div className="space-y-3">
          <label htmlFor="buscar-movimiento" className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
            {tipo === "entrada"
              ? "Buscar objeto en Wowhead"
              : "Seleccionar objeto del inventario del banco"}
          </label>

          {tipo === "entrada" ? (
            <div className="relative">
              <Search size={18} className="absolute left-3.5 top-3 text-neutral-500" />
              <input
                id="buscar-movimiento"
                value={busqueda}
                autoComplete="off"
                placeholder="Escribe el nombre del objeto..."
                onChange={(evento) => {
                  setBusqueda(evento.target.value);
                  setObjeto(null);
                  setError("");
                  setMensaje("");
                }}
                className="w-full bg-neutral-950 border border-red-900/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1 border border-neutral-800 rounded-xl bg-neutral-950/60">
              {objetosDisponibles.map((item) => {
                const seleccionado = objeto?.id === item.id;

                return (
                  <button
                    type="button"
                    key={item.id}
                    className={`flex items-center space-x-3 p-3 rounded-xl border text-left transition-all ${
                      seleccionado
                        ? "bg-red-950/60 border-red-600 shadow-md"
                        : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700"
                    }`}
                    aria-pressed={seleccionado}
                    onClick={() => {
                      seleccionarObjeto({
                        id: item.id,
                        nombre: item.nombre,
                        icono: item.icono,
                        calidad: item.calidad,
                      });
                    }}
                  >
                    {item.icono && (
                      <img
                        src={item.icono}
                        alt=""
                        className="w-10 h-10 rounded border border-neutral-700 object-cover flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <strong className="block text-xs font-semibold text-neutral-200 truncate">
                        {item.nombre}
                      </strong>
                      <span className="text-[11px] text-neutral-400 block font-mono">
                        Stock: <strong className="text-emerald-400">{item.cantidad}</strong>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {tipo === "entrada" && cargando && (
            <p className="text-xs text-neutral-400 animate-pulse py-2">Buscando objetos en Wowhead...</p>
          )}

          {tipo === "entrada" &&
            !cargando &&
            busqueda.trim().length >= 2 &&
            resultados.length === 0 &&
            objeto === null && (
              <p className="text-xs text-neutral-500 py-2">
                No se encontraron objetos. Comprueba el nombre e inténtalo de nuevo.
              </p>
            )}

          {tipo === "entrada" && resultados.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1 border border-neutral-800 rounded-xl bg-neutral-950/60">
              {resultados.map((resultado) => (
                <button
                  type="button"
                  key={resultado.id}
                  onClick={() => seleccionarObjeto(resultado)}
                  className="flex items-center space-x-3 p-2.5 rounded-lg bg-neutral-900/60 hover:bg-neutral-800 border border-neutral-800 hover:border-red-900/50 text-left transition"
                >
                  {resultado.icono && (
                    <img
                      src={resultado.icono}
                      alt=""
                      className="w-9 h-9 rounded border border-neutral-700 object-cover flex-shrink-0"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <strong className="block text-xs font-semibold text-neutral-200 truncate">
                      {resultado.nombre}
                    </strong>
                    <span className="text-[10px] text-neutral-500 font-mono">ID: {resultado.id}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {tipo === "salida" && objetosDisponibles.length === 0 && (
            <p className="text-xs text-red-400 py-2">
              No hay objetos con existencias disponibles para retirar.
            </p>
          )}
        </div>

        {/* Objeto Seleccionado & Formulario Detallado */}
        {objeto && (
          <div className="space-y-6 pt-4 border-t border-red-950 animate-fadeIn">
            <div className="bg-neutral-950 p-4 rounded-xl border border-red-900/40 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {objeto.icono && (
                  <img
                    src={objeto.icono}
                    alt=""
                    className="w-12 h-12 rounded border border-amber-900 object-cover flex-shrink-0 shadow"
                  />
                )}
                <div>
                  <span className="text-[10px] uppercase font-bold text-red-500 tracking-wider">Objeto Activo</span>
                  <strong className="block text-sm font-bold text-neutral-100">{objeto.nombre}</strong>
                  <div className="flex items-center space-x-3 text-xs text-neutral-400 font-mono mt-0.5">
                    <span>ID: {objeto.id}</span>
                    {tipo === "salida" && (
                      <span className="text-emerald-400 font-semibold">
                        Disponibles: {objetoDisponible?.cantidad ?? 0}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setObjeto(null);
                  setBusqueda("");
                  setError("");
                  setMensaje("");
                }}
                className="text-xs font-semibold text-neutral-400 hover:text-red-400 bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800 transition"
              >
                Cambiar
              </button>
            </div>

            {/* Grid de Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="cantidad-movimiento" className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center space-x-1.5">
                  <Layers size={14} className="text-red-500" />
                  <span>Cantidad</span>
                </label>
                <input
                  id="cantidad-movimiento"
                  type="number"
                  min="1"
                  step="1"
                  max={tipo === "salida" ? objetoDisponible?.cantidad : undefined}
                  value={cantidad}
                  onChange={(evento) => setCantidad(evento.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-red-600 rounded-xl px-4 py-2.5 text-sm text-neutral-100 focus:outline-none focus:ring-1 focus:ring-red-600 transition font-mono"
                />
              </div>

              {tipo === "entrada" && (
                <div className="space-y-2">
                  <label htmlFor="miembro-entrega" className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center space-x-1.5">
                    <User size={14} className="text-red-500" />
                    <span>Entregado por</span>
                  </label>
                  <select
                    id="miembro-entrega"
                    value={miembroEntregaId}
                    onChange={(evento) => setMiembroEntregaId(evento.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-red-600 rounded-xl px-4 py-2.5 text-sm text-neutral-100 focus:outline-none focus:ring-1 focus:ring-red-600 transition"
                  >
                    <option value="">Selecciona un miembro</option>
                    {miembrosActivos.map((miembro) => (
                      <option key={miembro.id} value={miembro.id}>
                        {miembro.nick}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="motivo-movimiento" className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center space-x-1.5">
                  <FileText size={14} className="text-red-500" />
                  <span>Motivo</span>
                </label>
                <select
                  id="motivo-movimiento"
                  value={motivo}
                  onChange={(evento) => setMotivo(evento.target.value as MotivoMovimiento)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-red-600 rounded-xl px-4 py-2.5 text-sm text-neutral-100 focus:outline-none focus:ring-1 focus:ring-red-600 transition"
                >
                  {MOTIVOS.map((opcion) => (
                    <option key={opcion} value={opcion}>
                      {opcion}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="observacion-movimiento" className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Observación (opcional)
                </label>
                <textarea
                  id="observacion-movimiento"
                  value={observacion}
                  onChange={(evento) => setObservacion(evento.target.value)}
                  placeholder="Añade detalles si es necesario..."
                  rows={3}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-red-600 rounded-xl px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-red-600 transition resize-none"
                />
              </div>
            </div>

            {/* Errores y Mensajes */}
            {error && (
              <div className="bg-red-950/80 border-l-4 border-red-600 p-3.5 rounded-r-lg text-xs text-red-200 flex items-center space-x-3 shadow" role="alert">
                <ShieldAlert size={18} className="text-red-500 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {mensaje && (
              <div className="bg-emerald-950/80 border-l-4 border-emerald-500 p-3.5 rounded-r-lg text-xs text-emerald-200 flex items-center space-x-3 shadow" role="status">
                <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
                <span>{mensaje}</span>
              </div>
            )}

            {/* Botón de Guardar */}
            <button
              type="button"
              className="w-full bg-red-950 hover:bg-red-900 border border-red-700 text-red-100 font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-xs"
              disabled={guardando}
              onClick={guardar}
            >
              {guardando ? (
                <span className="animate-pulse">Registrando movimiento...</span>
              ) : (
                <>
                  <Send size={16} />
                  <span>Registrar movimiento</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Alertas sin objeto seleccionado */}
        {!objeto && (error || mensaje) && (
          <div className="space-y-3 pt-2">
            {error && (
              <div className="bg-red-950/80 border-l-4 border-red-600 p-3.5 rounded-r-lg text-xs text-red-200 flex items-center space-x-3" role="alert">
                <ShieldAlert size={18} className="text-red-500 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {mensaje && (
              <div className="bg-emerald-950/80 border-l-4 border-emerald-500 p-3.5 rounded-r-lg text-xs text-emerald-200 flex items-center space-x-3" role="status">
                <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
                <span>{mensaje}</span>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}