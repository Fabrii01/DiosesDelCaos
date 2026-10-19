import { useEffect, useState, type FormEvent } from "react";
import {
  actualizarMiembro,
  clasesWoW,
  escucharMiembros,
  registrarMiembro,
  type MiembroGuild,
} from "../services/miembrosService";
import {
  Users as UsersIcon,
  UserPlus,
  UserPen,
  ShieldAlert,
  CheckCircle2,
  Shield,
  Award,
  Sparkles,
  Edit3,
  X,
  Send,
  Wrench,
  MessageSquare,
  PhoneCall,
  FileText,
} from "lucide-react";

export default function Usuarios() {
  const [miembros, setMiembros] = useState<MiembroGuild[]>([]);
  const [nick, setNick] = useState("");
  const [clase, setClase] = useState("");
  const [spec, setSpec] = useState("");
  const [gearscore, setGearscore] = useState("0");
  const [profesion, setProfesion] = useState("");
  const [discord, setDiscord] = useState(false);
  const [whatsapp, setWhatsapp] = useState(false);
  const [notas, setNotas] = useState("");

  const [miembroEditando, setMiembroEditando] = useState<string | null>(null);

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    return escucharMiembros(
      setMiembros,
      (error) => {
        console.error("Error cargando miembros:", error);
        setError("No se pudieron cargar los miembros de la guild.");
      },
    );
  }, []);

  function limpiarFormulario() {
    setNick("");
    setClase("");
    setSpec("");
    setGearscore("0");
    setProfesion("");
    setDiscord(false);
    setWhatsapp(false);
    setNotas("");
    setMiembroEditando(null);
    setError("");
    setMensaje("");
  }

  function iniciarEdicion(miembro: MiembroGuild & { profesion?: string; discord?: boolean; whatsapp?: boolean; notas?: string }) {
    setMiembroEditando(miembro.id);
    setNick(miembro.nick);
    setClase(miembro.clase);
    setSpec(miembro.spec);
    setGearscore(String(miembro.gearscore));
    setProfesion(miembro.profesion || "");
    setDiscord(miembro.discord || false);
    setWhatsapp(miembro.whatsapp || false);
    setNotas(miembro.notas || "");
    setError("");
    setMensaje("");
  }

  async function manejarRegistro(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError("");
    setMensaje("");

    const puntuacion = Number(gearscore);

    if (!Number.isSafeInteger(puntuacion) || puntuacion < 0) {
      setError("Ingresa un gearscore entero igual o mayor que cero.");
      return;
    }

    setGuardando(true);

    try {
      const datos = {
        nick,
        clase,
        spec,
        gearscore: puntuacion,
        profesion: profesion.trim(),
        discord,
        whatsapp,
        notas: notas.trim(),
      };

      if (miembroEditando) {
        await actualizarMiembro(miembroEditando, datos);
        limpiarFormulario();
        setMensaje("Miembro actualizado correctamente.");
      } else {
        await registrarMiembro(datos);
        limpiarFormulario();
        setMensaje("Miembro registrado correctamente.");
      }
    } catch (error) {
      console.error("Error guardando miembro:", error);
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el miembro.",
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="max-w-7xl mx-auto space-y-8 text-neutral-100">
      <div className="border-b border-red-900/40 pb-6 relative">
        <div className="absolute -top-3 left-0 w-24 h-1 bg-gradient-to-r from-red-600 to-transparent"></div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-wider text-red-500 uppercase drop-shadow-[0_2px_10px_rgba(239,68,68,0.3)]">
          Gestión de Huestes
        </h1>
        <p className="text-neutral-400 mt-2 text-sm md:text-base">
          Registro, profesiones, contacto y estatus de los guerreros de <span className="text-red-400 font-semibold">Dioses del Caos</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulario Izquierdo */}
        <div className="lg:col-span-1 bg-neutral-900/90 border border-red-950 rounded-2xl p-6 shadow-xl space-y-6 h-fit">
          <div className="flex items-center space-x-3 pb-4 border-b border-neutral-800">
            <div className="p-2.5 bg-red-950/80 border border-red-800/40 rounded-xl text-red-500 shadow">
              {miembroEditando ? <UserPen size={20} /> : <UserPlus size={20} />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-100">
                {miembroEditando ? "Editar guerrero" : "Nuevo miembro"}
              </h2>
              <span className="text-xs text-neutral-500">Roster de hermandad</span>
            </div>
          </div>

          <form onSubmit={manejarRegistro} className="space-y-4">
            <div>
              <label htmlFor="miembro-nick" className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                Nick del personaje
              </label>
              <input
                id="miembro-nick"
                value={nick}
                onChange={(evento) => setNick(evento.target.value)}
                placeholder="Ej. Haaland"
                maxLength={50}
                required
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-red-600 rounded-xl px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-red-600 transition"
              />
            </div>

            <div>
              <label htmlFor="miembro-clase" className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                Clase
              </label>
              <select
                id="miembro-clase"
                value={clase}
                onChange={(evento) => setClase(evento.target.value)}
                required
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-red-600 rounded-xl px-4 py-2.5 text-sm text-neutral-100 focus:outline-none focus:ring-1 focus:ring-red-600 transition"
              >
                <option value="">Selecciona una clase</option>
                {clasesWoW.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {opcion}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="miembro-spec" className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Spec
                </label>
                <input
                  id="miembro-spec"
                  value={spec}
                  onChange={(evento) => setSpec(evento.target.value)}
                  placeholder="Ej. Holy"
                  maxLength={40}
                  required
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-red-600 rounded-xl px-3 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-red-600 transition"
                />
              </div>

              <div>
                <label htmlFor="miembro-gearscore" className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Gearscore
                </label>
                <input
                  id="miembro-gearscore"
                  type="number"
                  min="0"
                  step="1"
                  value={gearscore}
                  onChange={(evento) => setGearscore(evento.target.value)}
                  required
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-red-600 rounded-xl px-3 py-2.5 text-sm text-neutral-100 focus:outline-none focus:ring-1 focus:ring-red-600 transition font-mono font-bold text-amber-400"
                />
              </div>
            </div>

            <div>
              <label htmlFor="miembro-profesion" className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                Profesión principal
              </label>
              <input
                id="miembro-profesion"
                value={profesion}
                onChange={(evento) => setProfesion(evento.target.value)}
                placeholder="Ej. Herrería / Minería"
                maxLength={50}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-red-600 rounded-xl px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-red-600 transition"
              />
            </div>

            {/* Checkboxes de Discord y WhatsApp */}
            <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-3">
              <span className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">Canales de comunicación</span>
              <div className="flex items-center justify-between">
                <label htmlFor="check-discord" className="flex items-center space-x-2 text-sm text-neutral-300 cursor-pointer">
                  <MessageSquare size={16} className="text-indigo-400" />
                  <span>Discord activo</span>
                </label>
                <input
                  id="check-discord"
                  type="checkbox"
                  checked={discord}
                  onChange={(e) => setDiscord(e.target.checked)}
                  className="w-4 h-4 accent-red-600 rounded bg-neutral-900 border-neutral-700 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-900">
                <label htmlFor="check-whatsapp" className="flex items-center space-x-2 text-sm text-neutral-300 cursor-pointer">
                  <PhoneCall size={16} className="text-emerald-400" />
                  <span>WhatsApp activo</span>
                </label>
                <input
                  id="check-whatsapp"
                  type="checkbox"
                  checked={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.checked)}
                  className="w-4 h-4 accent-red-600 rounded bg-neutral-900 border-neutral-700 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label htmlFor="miembro-notas" className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                Notas adicionales
              </label>
              <textarea
                id="miembro-notas"
                rows={2}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Ej. Horario de raid, suplente..."
                maxLength={200}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-red-600 rounded-xl px-4 py-2 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-red-600 transition resize-none"
              />
            </div>

            {error && (
              <div className="bg-red-950/80 border-l-4 border-red-600 p-3 rounded-r-lg text-xs text-red-200 flex items-center space-x-2" role="alert">
                <ShieldAlert size={16} className="text-red-500 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {mensaje && (
              <div className="bg-emerald-950/80 border-l-4 border-emerald-500 p-3 rounded-r-lg text-xs text-emerald-200 flex items-center space-x-2" role="status">
                <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                <span>{mensaje}</span>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                type="submit"
                className="w-full bg-red-950 hover:bg-red-900 border border-red-700 text-red-100 font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-xs"
                disabled={guardando}
              >
                {guardando ? (
                  <span className="animate-pulse">Guardando...</span>
                ) : (
                  <>
                    <Send size={15} />
                    <span>{miembroEditando ? "Guardar cambios" : "Registrar miembro"}</span>
                  </>
                )}
              </button>

              {miembroEditando && (
                <button
                  type="button"
                  onClick={limpiarFormulario}
                  disabled={guardando}
                  className="w-full bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-neutral-200 py-2.5 px-4 rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-2"
                >
                  <X size={15} />
                  <span>Cancelar edición</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tabla Derecha Ampliada */}
        <div className="lg:col-span-2 bg-neutral-900/70 border border-red-950 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-red-950/80 border border-red-800/40 rounded-xl text-red-500 shadow">
                <UsersIcon size={20} />
              </div>
              <h2 className="text-xl font-bold text-neutral-100">
                Miembros registrados <span className="text-red-500 text-base">({miembros.length})</span>
              </h2>
            </div>
          </div>

          {miembros.length === 0 ? (
            <div className="text-center py-16 space-y-3 bg-neutral-950/40 rounded-xl border border-neutral-800">
              <Shield size={40} className="mx-auto text-neutral-600" />
              <p className="text-sm text-neutral-400 font-medium">Todavía no hay miembros registrados en la hermandad.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-neutral-800 rounded-xl">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-neutral-950 border-b border-red-950 text-xs font-semibold text-red-400 uppercase tracking-wider">
                    <th className="p-3.5">Guerrero</th>
                    <th className="p-3.5">Clase / Spec</th>
                    <th className="p-3.5">Profesión</th>
                    <th className="p-3.5">GS</th>
                    <th className="p-3.5 text-center">Canales</th>
                    <th className="p-3.5">Notas</th>
                    <th className="p-3.5 text-center">Acciones</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-800/60 font-medium text-xs">
                  {miembros.map((miembro: any) => (
                    <tr key={miembro.id} className="hover:bg-neutral-800/40 transition-colors group">
                      <td className="p-3.5">
                        <strong className="text-neutral-100 font-bold text-sm group-hover:text-red-400 transition-colors">
                          {miembro.nick}
                        </strong>
                      </td>

                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-neutral-950 border border-neutral-800 text-neutral-200">
                            <Sparkles size={10} className="text-red-500" />
                            <span>{miembro.clase}</span>
                          </span>
                          <div className="text-neutral-400 text-[11px] pl-1">{miembro.spec}</div>
                        </div>
                      </td>

                      <td className="p-3.5 text-neutral-300">
                        {miembro.profesion ? (
                          <span className="inline-flex items-center space-x-1 text-neutral-300">
                            <Wrench size={12} className="text-amber-500 flex-shrink-0" />
                            <span>{miembro.profesion}</span>
                          </span>
                        ) : (
                          <span className="text-neutral-600">—</span>
                        )}
                      </td>

                      <td className="p-3.5 font-mono font-bold text-amber-400 text-sm">
                        <div className="flex items-center space-x-1">
                          <Award size={13} className="text-amber-500" />
                          <span>{miembro.gearscore.toLocaleString("en-US")}</span>
                        </div>
                      </td>

                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <span
                            title={miembro.discord ? "Discord Activo" : "Sin Discord"}
                            className={`w-6 h-6 rounded-md flex items-center justify-center border ${
                              miembro.discord
                                ? "bg-indigo-950/80 text-indigo-400 border-indigo-800/60 shadow"
                                : "bg-neutral-950 text-neutral-700 border-neutral-800 opacity-40"
                            }`}
                          >
                            <MessageSquare size={13} />
                          </span>
                          <span
                            title={miembro.whatsapp ? "WhatsApp Activo" : "Sin WhatsApp"}
                            className={`w-6 h-6 rounded-md flex items-center justify-center border ${
                              miembro.whatsapp
                                ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/60 shadow"
                                : "bg-neutral-950 text-neutral-700 border-neutral-800 opacity-40"
                            }`}
                          >
                            <PhoneCall size={13} />
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5 text-neutral-300 max-w-[200px]">
  {miembro.notas ? (
    <div className="group relative cursor-pointer">
      <p className="line-clamp-2 text-xs text-neutral-300 leading-tight">
        {miembro.notas}
      </p>
      {/* Tooltip emergente al pasar el ratón para notas largas */}
      {miembro.notas.length > 40 && (
        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2.5 bg-neutral-950 border border-red-900/60 text-neutral-200 text-xs rounded-lg shadow-2xl z-30 whitespace-normal break-words pointer-events-none">
          {miembro.notas}
        </div>
      )}
    </div>
  ) : (
    <span className="text-neutral-600">—</span>
  )}
</td>

                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => iniciarEdicion(miembro)}
                          disabled={guardando}
                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-neutral-950 hover:bg-red-950/60 text-neutral-300 hover:text-red-400 border border-neutral-800 hover:border-red-900/60 rounded-lg text-xs font-semibold transition"
                        >
                          <Edit3 size={12} />
                          <span>Editar</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}