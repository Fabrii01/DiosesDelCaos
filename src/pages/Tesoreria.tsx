import { useEffect, useState, type FormEvent } from "react";
import {
  escucharMovimientosOro,
  escucharSaldoOro,
  registrarOperacionOro,
  type MovimientoOro,
  type TipoOperacionOro,
} from "../services/tesoreriaService";
import {
  buscarObjetosWowhead,
  type ObjetoWowhead,
} from "../services/wowheadService";
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Search,
  ShieldAlert,
  CheckCircle2,
  FileText,
  DollarSign,
  Send,
  ExternalLink,
} from "lucide-react";

function formatearOro(cantidad: number): string {
  return `${cantidad.toLocaleString("en-US")}g`;
}

export default function Tesoreria() {
  const [saldo, setSaldo] = useState(0);
  const [movimientos, setMovimientos] = useState<MovimientoOro[]>([]);

  const [tipo, setTipo] = useState<TipoOperacionOro>("ingreso");
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");
  const [observacion, setObservacion] = useState("");

  // Buscador y objeto seleccionado de WoWHead (para ingresos y gastos)
  const [busquedaObjeto, setBusquedaObjeto] = useState("");
  const [resultadosObjeto, setResultadosObjeto] = useState<ObjetoWowhead[]>([]);
  const [objetoSeleccionado, setObjetoSeleccionado] = useState<ObjetoWowhead | null>(null);
  const [buscandoObjeto, setBuscandoObjeto] = useState(false);
  const [errorBusquedaObjeto, setErrorBusquedaObjeto] = useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    let saldoCargado = false;
    let movimientosCargados = false;

    const actualizarCarga = () => {
      if (saldoCargado && movimientosCargados) {
        setCargando(false);
      }
    };

    const cancelarSaldo = escucharSaldoOro(
      (nuevoSaldo) => {
        setSaldo(nuevoSaldo);
        saldoCargado = true;
        actualizarCarga();
      },
      (errorSaldo) => {
        console.error("Error cargando el saldo:", errorSaldo);
        setError("No se pudo cargar el saldo de oro.");
        saldoCargado = true;
        actualizarCarga();
      },
    );

    const cancelarMovimientos = escucharMovimientosOro(
      (lista) => {
        setMovimientos(lista);
        movimientosCargados = true;
        actualizarCarga();
      },
      (errorMovimientos) => {
        console.error("Error cargando los indicadores de tesorería:", errorMovimientos);
        setError("No se pudieron cargar los indicadores de tesorería.");
        movimientosCargados = true;
        actualizarCarga();
      },
    );

    return () => {
      cancelarSaldo();
      cancelarMovimientos();
    };
  }, []);

  useEffect(() => {
    const termino = busquedaObjeto.trim();

    if (objetoSeleccionado !== null || termino.length < 2) {
      setResultadosObjeto([]);
      setBuscandoObjeto(false);
      setErrorBusquedaObjeto("");
      return;
    }

    let cancelado = false;

    const temporizador = window.setTimeout(async () => {
      setBuscandoObjeto(true);
      setErrorBusquedaObjeto("");

      try {
        const resultados = await buscarObjetosWowhead(termino);

        if (!cancelado) {
          setResultadosObjeto(resultados);
        }
      } catch (errorDesconocido) {
        console.error("Error buscando objetos en WoWHead:", errorDesconocido);

        if (!cancelado) {
          setResultadosObjeto([]);
          setErrorBusquedaObjeto("No se pudieron buscar los objetos. Inténtalo nuevamente.");
        }
      } finally {
        if (!cancelado) {
          setBuscandoObjeto(false);
        }
      }
    }, 300);

    return () => {
      cancelado = true;
      window.clearTimeout(temporizador);
    };
  }, [busquedaObjeto, objetoSeleccionado]);

  function limpiarObjetoSeleccionado() {
    setObjetoSeleccionado(null);
    setBusquedaObjeto("");
    setResultadosObjeto([]);
    setErrorBusquedaObjeto("");
  }

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError("");
    setMensaje("");

    const cantidadNumerica = Number(cantidad);

    if (!Number.isSafeInteger(cantidadNumerica) || cantidadNumerica <= 0) {
      setError("Ingresa una cantidad entera de oro mayor que cero.");
      return;
    }

    if (!motivo.trim()) {
      setError("Escribe el motivo de la operación.");
      return;
    }

    if (tipo === "gasto" && cantidadNumerica > saldo) {
      setError("No hay suficiente oro disponible para ese gasto.");
      return;
    }

    if (observacion.trim().length > 500) {
      setError("La observación no puede superar los 500 caracteres.");
      return;
    }

    if (busquedaObjeto.trim().length > 150) {
      setError("La búsqueda del objeto no puede superar los 150 caracteres.");
      return;
    }

    setGuardando(true);

    try {
      await registrarOperacionOro(
        tipo,
        cantidadNumerica,
        motivo,
        observacion,
        objetoSeleccionado?.nombre ?? "",
        objetoSeleccionado ?? undefined,
      );

      setCantidad("");
      setMotivo("");
      setObservacion("");
      limpiarObjetoSeleccionado();

      setMensaje(
        tipo === "ingreso"
          ? "Ingreso registrado correctamente."
          : "Gasto registrado correctamente.",
      );
    } catch (errorDesconocido) {
      console.error("Error registrando operación:", errorDesconocido);

      setError(
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "No se pudo registrar la operación.",
      );
    } finally {
      setGuardando(false);
    }
  }

  const totalIngresosCount = movimientos.filter((m) => m.tipo === "ingreso").length;
  const totalGastosCount = movimientos.filter((m) => m.tipo === "gasto").length;

  return (
    <section className="max-w-4xl mx-auto space-y-8 text-neutral-100">
      <div className="border-b border-red-900/40 pb-6 relative">
        <div className="absolute -top-3 left-0 w-24 h-1 bg-gradient-to-r from-red-600 to-transparent"></div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-wider text-red-500 uppercase drop-shadow-[0_2px_10px_rgba(239,68,68,0.3)]">
          Tesorería del Banco
        </h1>
        <p className="text-neutral-400 mt-2 text-sm md:text-base">
          Control financiero de arcas y capital de la hermandad <span className="text-red-400 font-semibold">Dioses del Caos</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <article className="bg-neutral-900/90 border border-amber-900/40 rounded-xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-400 uppercase font-semibold tracking-wider">Saldo en Arcas</span>
            <strong className="block text-2xl font-black text-amber-400 mt-1">
              {cargando ? "..." : formatearOro(saldo)}
            </strong>
          </div>
          <div className="p-3 bg-amber-950/80 border border-amber-800/40 rounded-xl text-amber-400 shadow">
            <Coins size={22} />
          </div>
        </article>

        <article className="bg-neutral-900/90 border border-emerald-900/40 rounded-xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-400 uppercase font-semibold tracking-wider">Ingresos</span>
            <strong className="block text-2xl font-black text-emerald-400 mt-1">
              {cargando ? "..." : totalIngresosCount.toLocaleString("en-US")}
            </strong>
          </div>
          <div className="p-3 bg-emerald-950/80 border border-emerald-800/40 rounded-xl text-emerald-400 shadow">
            <TrendingUp size={22} />
          </div>
        </article>

        <article className="bg-neutral-900/90 border border-red-900/40 rounded-xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-red-400 uppercase font-semibold tracking-wider">Gastos</span>
            <strong className="block text-2xl font-black text-red-400 mt-1">
              {cargando ? "..." : totalGastosCount.toLocaleString("en-US")}
            </strong>
          </div>
          <div className="p-3 bg-red-950/80 border border-red-800/40 rounded-xl text-red-400 shadow">
            <TrendingDown size={22} />
          </div>
        </article>
      </div>

      <div className="bg-neutral-900/80 border border-red-950 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
        <h2 className="text-xl font-bold text-neutral-200">Registrar operación de oro</h2>

        <form onSubmit={manejarEnvio} className="space-y-6">
          <div className="grid grid-cols-2 gap-4 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800">
            <button
              type="button"
              className={`flex items-center justify-center space-x-2 py-3 rounded-lg font-bold text-sm tracking-wide transition-all ${
                tipo === "ingreso"
                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60 shadow-md"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
              onClick={() => {
                setTipo("ingreso");
                setError("");
                setMensaje("");
              }}
              disabled={guardando}
            >
              <TrendingUp size={18} />
              <span>Ingreso de Oro</span>
            </button>

            <button
              type="button"
              className={`flex items-center justify-center space-x-2 py-3 rounded-lg font-bold text-sm tracking-wide transition-all ${
                tipo === "gasto"
                  ? "bg-red-950 text-red-400 border border-red-800/60 shadow-md"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
              onClick={() => {
                setTipo("gasto");
                setError("");
                setMensaje("");
              }}
              disabled={guardando}
            >
              <TrendingDown size={18} />
              <span>Gasto de Oro</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="cantidad-oro" className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center space-x-1.5">
                <DollarSign size={14} className="text-amber-500" />
                <span>Cantidad de oro</span>
              </label>
              <input
                id="cantidad-oro"
                type="number"
                min="1"
                step="1"
                required
                value={cantidad}
                onChange={(evento) => setCantidad(evento.target.value)}
                placeholder="Ej. 5000"
                disabled={guardando}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-500 transition font-mono font-bold text-amber-400"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="motivo-oro" className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center space-x-1.5">
                <FileText size={14} className="text-red-500" />
                <span>Motivo u origen</span>
              </label>
              <input
                id="motivo-oro"
                type="text"
                maxLength={150}
                required
                value={motivo}
                onChange={(evento) => setMotivo(evento.target.value)}
                placeholder={tipo === "ingreso" ? "Ej. Venta de items" : "Ej. Compra de materiales raid"}
                disabled={guardando}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-red-600 rounded-xl px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-red-600 transition"
              />
            </div>
          </div>

          {/* Objeto Vinculado (Disponible para Ingresos y Gastos) */}
          <div className="space-y-2 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
            <label htmlFor="buscar-objeto-tesoreria" className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
              {tipo === "ingreso" ? "Objeto vendido (opcional)" : "Objeto comprado / adquirido (opcional)"}
            </label>

            {objetoSeleccionado ? (
              <div className="flex items-center justify-between bg-neutral-900 p-3 rounded-lg border border-amber-900/60">
                <div className="flex items-center space-x-3">
                  <img
                    src={objetoSeleccionado.icono}
                    alt=""
                    className="w-10 h-10 rounded border border-amber-700 object-cover flex-shrink-0 shadow"
                  />
                  <div>
                    <strong className="block text-xs font-semibold text-neutral-200">{objetoSeleccionado.nombre}</strong>
                    <a
                      href={`https://www.wowhead.com/tbc/item=${objetoSeleccionado.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 text-[11px] text-amber-400 hover:underline font-mono"
                    >
                      <span>ID: {objetoSeleccionado.id}</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={limpiarObjetoSeleccionado}
                  disabled={guardando}
                  className="text-xs font-semibold text-neutral-400 hover:text-red-400 bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800 transition"
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <Search size={18} className="absolute left-3.5 top-3 text-neutral-500" />
                  <input
                    id="buscar-objeto-tesoreria"
                    type="search"
                    maxLength={150}
                    value={busquedaObjeto}
                    onChange={(evento) => {
                      setBusquedaObjeto(evento.target.value);
                      setObjetoSeleccionado(null);
                    }}
                    placeholder="Busca un objeto en Wowhead por su nombre..."
                    disabled={guardando}
                    autoComplete="off"
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-red-600 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-red-600 transition"
                  />
                </div>

                {buscandoObjeto && (
                  <p className="text-xs text-neutral-400 animate-pulse">Buscando objeto en Wowhead...</p>
                )}

                {errorBusquedaObjeto && (
                  <p className="text-xs text-red-400 bg-red-950/60 p-2.5 rounded-lg border border-red-800/50" role="alert">
                    {errorBusquedaObjeto}
                  </p>
                )}

                {resultadosObjeto.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-neutral-800 rounded-xl bg-neutral-900/60">
                    {resultadosObjeto.map((objeto) => (
                      <button
                        key={objeto.id}
                        type="button"
                        className="flex items-center space-x-3 p-2 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-900/50 text-left transition"
                        onClick={() => {
                          setObjetoSeleccionado(objeto);
                          setBusquedaObjeto(objeto.nombre);
                          setResultadosObjeto([]);
                          setErrorBusquedaObjeto("");
                        }}
                        disabled={guardando}
                      >
                        <img
                          src={objeto.icono}
                          alt=""
                          className="w-8 h-8 rounded border border-neutral-700 object-cover flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <strong className="block text-xs font-semibold text-neutral-200 truncate">{objeto.nombre}</strong>
                          <span className="text-[10px] text-neutral-500 font-mono">ID: {objeto.id}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="observacion-oro" className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Observación (opcional)
            </label>
            <textarea
              id="observacion-oro"
              maxLength={500}
              rows={3}
              value={observacion}
              onChange={(evento) => setObservacion(evento.target.value)}
              placeholder="Detalles adicionales de la operación financiera..."
              disabled={guardando}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-red-600 rounded-xl px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-red-600 transition resize-none"
            />
          </div>

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

          <button
            type="submit"
            disabled={guardando || cargando}
            className="w-full bg-red-950 hover:bg-red-900 border border-red-700 text-red-100 font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-xs"
          >
            {guardando ? (
              <span className="animate-pulse">Registrando operación...</span>
            ) : (
              <>
                <Send size={16} />
                <span>{tipo === "ingreso" ? "Registrar ingreso de oro" : "Registrar gasto de oro"}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}