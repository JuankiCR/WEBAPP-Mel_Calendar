// src/pages/AddNotaView.tsx
import { useState, useMemo, FormEvent, useRef, useEffect } from "react";
import {
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  format,
  addMonths,
  isSameDay,
  getDay,
  getHours,
  getMinutes,
} from "date-fns";
import { es } from "date-fns/locale";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { Button, Input, Select } from "waddle-ui";
import { extractColorFromCssVar } from "@/utils/ExtractColorFromCssVar";
import { uploadFile } from "@/services/storage";
import { storage, APPWRITE_BUCKET_ID } from "@/lib/appwrite";
import { useNotasStore } from "@/store/useNotasStore";
import type { Nota, TipoNota } from "@/services/notas";
import "./AddNotaView.css";

const daysOfWeek = ["D", "L", "Ma", "Mi", "J", "V", "S"];
const ZONA_MX = "America/Mexico_City";

/* Helpers para etiquetas y estado On Time */

function getTipoLabel(tipo?: TipoNota): string | null {
  switch (tipo) {
    case "inicio-jornada":
      return "Inicio jornada";
    case "salida-comida":
      return "Salida comida";
    case "regreso-comida":
      return "Regreso comida";
    case "fin-jornada":
      return "Fin jornada";
    default:
      return null;
  }
}

function getStatusLabel(nota: Nota, notasDelDia: Nota[]): string | null {
  if (!nota.tipo || nota.tipo === "general") return null;

  const fechaLocal = toZonedTime(nota.fecha, ZONA_MX);
  const h = getHours(fechaLocal);
  const m = getMinutes(fechaLocal);
  const minutos = h * 60 + m;

  // Configs desde CSS con fallback a tus valores actuales
  const inicioJornadaCfg = getCssTime("--hora-inicio-jornada", {
    hour: 8,
    minute: 0,
  });
  const salidaComidaDesdeCfg = getCssTime("--hora-salida-comida-desde", {
    hour: 12,
    minute: 0,
  });
  const salidaComidaHastaCfg = getCssTime("--hora-salida-comida-hasta", {
    hour: 16,
    minute: 30,
  });
  const finJornadaCfg = getCssTime("--hora-fin-jornada", {
    hour: 18,
    minute: 0,
  });
  const duracionMaxComidaMin = getCssNumber(
    "--duracion-max-comida-min",
    60 // fallback 60 minutos
  );

  const inicioJornadaMin = toMinutes(inicioJornadaCfg);
  const salidaDesdeMin = toMinutes(salidaComidaDesdeCfg);
  const salidaHastaMin = toMinutes(salidaComidaHastaCfg);
  const finJornadaMin = toMinutes(finJornadaCfg);

  // Inicio jornada: On Time si antes o a la hora configurada
  if (nota.tipo === "inicio-jornada") {
    if (minutos <= inicioJornadaMin) return "On Time";
    return "Tarde";
  }

  // Salida comida: On Time si dentro de la ventana configurada
  if (nota.tipo === "salida-comida") {
    const dentroVentana =
      minutos >= salidaDesdeMin && minutos <= salidaHastaMin;
    if (dentroVentana) return "On Time";
    return "Fuera de horario";
  }

  // Regreso comida: On Time si <= duración máxima configurada desde última salida
  if (nota.tipo === "regreso-comida") {
    const salidas = notasDelDia.filter((n) => n.tipo === "salida-comida");
    if (salidas.length === 0) return "Sin salida registrada";

    const ultimaSalida = salidas.reduce((acc, curr) =>
      new Date(curr.fecha) > new Date(acc.fecha) ? curr : acc
    );

    const salidaLocal = toZonedTime(ultimaSalida.fecha, ZONA_MX);
    const diffMin =
      (fechaLocal.getTime() - salidaLocal.getTime()) / (1000 * 60);

    if (diffMin <= duracionMaxComidaMin && diffMin >= 0) return "On Time";
    if (diffMin < 0) return "Antes de la salida";
    return "Fuera de tiempo";
  }

  // Fin jornada: On Time si después o a la hora configurada
  if (nota.tipo === "fin-jornada") {
    if (minutos >= finJornadaMin) return "On Time";
    return "Salida anticipada";
  }

  return null;
}

type TimeConfig = { hour: number; minute: number };

function parseTimeStringToConfig(value: string | null, fallback: TimeConfig): TimeConfig {
  if (!value) return fallback;
  const trimmed = value.trim();
  const [hStr, mStr] = trimmed.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return fallback;
  return { hour: h, minute: m };
}

function getCssTime(varName: string, fallback: TimeConfig): TimeConfig {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(varName);
  return parseTimeStringToConfig(raw, fallback);
}

function getCssNumber(varName: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  const n = Number(raw);
  return Number.isNaN(n) ? fallback : n;
}

function toMinutes({ hour, minute }: TimeConfig): number {
  return hour * 60 + minute;
}

const AddNotaView = () => {
  const primaryColor = extractColorFromCssVar("--primary-color");
  const { notas, agregarNota, actualizarNota, cargarNotas } = useNotasStore();

  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [texto, setTexto] = useState("");
  const [tipoNota, setTipoNota] = useState<TipoNota>("general");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const [imageUploading, setImageUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(false);
  const [videoUploaded, setVideoUploaded] = useState(false);

  const [notaBorradorId, setNotaBorradorId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [notaActiva, setNotaActiva] = useState<Nota | null>(null);

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  // cargar notas al entrar
  useEffect(() => {
    cargarNotas();
  }, [cargarNotas]);

  const daysInMonth = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
      }),
    [currentMonth]
  );

  // celdas del calendario
  const calendarCells = useMemo(() => {
    const cells: (Date | null)[] = [];
    const firstDay = daysInMonth[0];
    if (!firstDay) return cells;

    const offset = getDay(firstDay); // 0 = domingo
    for (let i = 0; i < offset; i++) cells.push(null);
    cells.push(...daysInMonth);

    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [daysInMonth]);

  // notas del día seleccionado
  const notasDelDia = useMemo(
    () =>
      notas.filter((n) => {
        const fecha = new Date(n.fecha);
        return isSameDay(fecha, selectedDate);
      }),
    [notas, selectedDate]
  );

  const horarioLabels = useMemo(() => {
    const getVar = (name: string, fallback: string) => {
      if (typeof window === "undefined") return fallback;
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
      return raw || fallback;
    };

    return {
      inicio: getVar("--hora-inicio-jornada", "08:00"),
      salidaDesde: getVar("--hora-salida-comida-desde", "12:00"),
      salidaHasta: getVar("--hora-salida-comida-hasta", "16:30"),
      fin: getVar("--hora-fin-jornada", "18:00"),
    };
  }, []);

  const handlePrevMonth = () => {
    const prev = addMonths(currentMonth, -1);
    setCurrentMonth(prev);
    if (
      selectedDate.getMonth() !== prev.getMonth() ||
      selectedDate.getFullYear() !== prev.getFullYear()
    ) {
      setSelectedDate(prev);
    }
  };

  const handleNextMonth = () => {
    const next = addMonths(currentMonth, 1);
    setCurrentMonth(next);
    if (
      selectedDate.getMonth() !== next.getMonth() ||
      selectedDate.getFullYear() !== next.getFullYear()
    ) {
      setSelectedDate(next);
    }
  };

  const handleSelectDay = (day: Date) => {
    setSelectedDate(day);
  };

  // Helper: crea o actualiza la nota base (tipo + texto + fecha) y devuelve la nota
  const crearOActualizarNotaBase = async (): Promise<Nota> => {
    const now = new Date();
    const fechaConHora = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
      now.getMilliseconds()
    );

    if (notaBorradorId) {
      // update
      const notaActualizada = await actualizarNota(notaBorradorId, {
        texto,
        tipo: tipoNota,
        fecha: fechaConHora.toISOString(),
      });
      return notaActualizada;
    } else {
      // create
      const nuevaNota = await agregarNota({
        fecha: fechaConHora.toISOString(),
        texto,
        tipo: tipoNota,
      });
      setNotaBorradorId(nuevaNota.$id);
      return nuevaNota;
    }
  };

  // Click en "Imagen": primero aseguras nota base, luego abres selector/cámara
  const handleClickImagen = async () => {
    setError(null);
    setSuccess(null);

    if (!texto.trim()) {
      setError("Primero escribe un nombre o descripción para la nota");
      return;
    }

    if (isSaving || imageUploading) return;

    try {
      setIsSaving(true);
      await crearOActualizarNotaBase();
      imageInputRef.current?.click();
    } catch (err: any) {
      console.error("Error al preparar nota para imagen:", err);
      setError(err?.message ?? "No se pudo preparar la nota para adjuntar imagen");
    } finally {
      setIsSaving(false);
    }
  };

  // Click en "Video": igual que imagen
  const handleClickVideo = async () => {
    setError(null);
    setSuccess(null);

    if (!texto.trim()) {
      setError("Primero escribe un nombre o descripción para la nota");
      return;
    }

    if (isSaving || videoUploading) return;

    try {
      setIsSaving(true);
      await crearOActualizarNotaBase();
      videoInputRef.current?.click();
    } catch (err: any) {
      console.error("Error al preparar nota para video:", err);
      setError(err?.message ?? "No se pudo preparar la nota para adjuntar video");
    } finally {
      setIsSaving(false);
    }
  };

  // Cuando el usuario selecciona una imagen
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    setImageFile(file);
    setError(null);
    setSuccess(null);

    if (!notaBorradorId) {
      // En teoría no debería pasar porque antes llamamos a crearOActualizarNotaBase
      return;
    }

    setImageUploading(true);
    setImageUploaded(false);

    try {
      const fileId = await uploadFile(file);
      await actualizarNota(notaBorradorId, { imagenId: fileId });
      setImageUploaded(true);
    } catch (err: any) {
      console.error("Error al subir imagen:", err);
      setError(err?.message ?? "Error al subir imagen");
      setImageUploaded(false);
    } finally {
      setImageUploading(false);
    }
  };

  // Cuando el usuario selecciona un video
  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    setVideoFile(file);
    setError(null);
    setSuccess(null);

    if (!notaBorradorId) {
      // Igual, en teoría ya debería existir la nota
      return;
    }

    setVideoUploading(true);
    setVideoUploaded(false);

    try {
      const fileId = await uploadFile(file);
      await actualizarNota(notaBorradorId, { videoId: fileId });
      setVideoUploaded(true);
    } catch (err: any) {
      console.error("Error al subir video:", err);
      setError(err?.message ?? "Error al subir video");
      setVideoUploaded(false);
    } finally {
      setVideoUploading(false);
    }
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!texto.trim()) {
      setError("Escribe algo en la nota");
      return;
    }

    if (isSaving) return;

    try {
      setIsSaving(true);

      // Solo asegura que la nota base quede guardada / actualizada.
      await crearOActualizarNotaBase();

      // La imagen / video ya se subieron en sus handlers y se hizo update ahí.
      setSuccess("Nota guardada correctamente ✨");

      // Limpiar formulario para una nueva nota
      setTexto("");
      setTipoNota("general");
      setImageFile(null);
      setVideoFile(null);
      setImageUploaded(false);
      setVideoUploaded(false);
      setNotaBorradorId(null);

      if (imageInputRef.current) imageInputRef.current.value = "";
      if (videoInputRef.current) videoInputRef.current.value = "";
    } catch (err: any) {
      console.error("Error al guardar nota:", err);
      setError(err?.message ?? "Error al guardar la nota");
    } finally {
      setIsSaving(false);
    }
  }

  const getImagePreviewUrl = (fileId: string) =>
    storage.getFilePreview(APPWRITE_BUCKET_ID, fileId, 600, 0).toString();

  const getVideoUrl = (fileId: string) =>
    storage.getFileView(APPWRITE_BUCKET_ID, fileId).toString();

  return (
    <div className="addnota-page">
      {/* TARJETA CALENDARIO */}
      <section className="card calendar-card">
        <header className="calendar-header">
          <button className="nav-btn" type="button" onClick={handlePrevMonth}>
            ‹
          </button>
          <div className="calendar-title">
            <span className="calendar-month">
              {format(currentMonth, "MMMM", { locale: es })}
            </span>
            <span className="calendar-year">
              {format(currentMonth, "yyyy")}
            </span>
          </div>
          <button className="nav-btn" type="button" onClick={handleNextMonth}>
            ›
          </button>
        </header>

        {/* Encabezado D L Ma Mi J V S */}
        <div className="dow-row">
          {daysOfWeek.map((label) => (
            <div key={label} className="dow-cell">
              {label}
            </div>
          ))}
        </div>

        {/* Grilla de días */}
        <div className="days-grid">
          {calendarCells.map((day, idx) => {
            if (!day) {
              return <div key={`empty-${idx}`} className="day-empty" />;
            }

            const selected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());

            const classes: string[] = ["day-box"];
            if (selected) {
              classes.push("day-box--selected");
            } else if (isToday) {
              classes.push("day-box--today");
            }

            return (
              <button
                key={day.toISOString()}
                type="button"
                className={classes.join(" ")}
                onClick={() => handleSelectDay(day)}
              >
                <span className="day-number">{format(day, "d")}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* TARJETA NOTA */}
      <section className="card note-card">
        <header className="note-header">
          <h2>Notas</h2>
          <span className="note-date">
            {format(selectedDate, "PPP", { locale: es })}
          </span>
        </header>

        <form className="note-form" onSubmit={handleSubmit}>
          {/* Select de tipo de nota */}
          <Select
            label="Tipo de registro"
            color={primaryColor}
            fullWidth
            value={tipoNota}
            onChange={(e) => setTipoNota(e.target.value as TipoNota)}
            placeholder="Selecciona un tipo"
            options={[
              { value: "general", label: "Nota general" },
              {
                value: "inicio-jornada",
                label: `Inicio de jornada (${horarioLabels.inicio})`,
              },
              {
                value: "salida-comida",
                label: `Salida comida (${horarioLabels.salidaDesde} - ${horarioLabels.salidaHasta})`,
              },
              { value: "regreso-comida", label: "Regreso comida" },
              {
                value: "fin-jornada",
                label: `Fin jornada (${horarioLabels.fin})`,
              },
            ]}
          />

          <Input
            color={primaryColor}
            type="textarea"
            placeholder="Escribe tu nota aquí..."
            value={texto}
            onChange={(e: any) => setTexto(e.target.value)}
          />

          <div className="media-row">
            {/* Imagen */}
            <div
              className="media-slot"
              onClick={handleClickImagen}
            >
              <span className="media-title">
                {imageUploaded ? "Imagen cargada" : "Imagen"}
              </span>
              {imageUploading && (
                <span className="media-status">Cargando imagen…</span>
              )}
              {!imageUploading && imageFile && (
                <span className="media-file-name">{imageFile.name}</span>
              )}
              {!imageUploading && !imageFile && (
                <span className="media-placeholder">Toca para seleccionar</span>
              )}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                // capture="environment"
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
            </div>

            {/* Video */}
            <div
              className="media-slot"
              onClick={handleClickVideo}
            >
              <span className="media-title">
                {videoUploaded ? "Video cargado" : "Video"}
              </span>
              {videoUploading && (
                <span className="media-status">Cargando video…</span>
              )}
              {!videoUploading && videoFile && (
                <span className="media-file-name">{videoFile.name}</span>
              )}
              {!videoUploading && !videoFile && (
                <span className="media-placeholder">Toca para seleccionar</span>
              )}
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                // capture="environment"
                style={{ display: "none" }}
                onChange={handleVideoChange}
              />
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}
          {success && <p className="auth-success">{success}</p>}

          <div className="note-actions">
            <Button
              color={primaryColor}
              type="submit"
              disabled={isSaving || !texto.trim()}
              isLoading={isSaving}
            >
              {isSaving ? "Guardando..." : "Guardar nota"}
            </Button>
          </div>
        </form>
      </section>

      {/* LISTA DE NOTAS DEL DÍA */}
      {notasDelDia.length > 0 && (
        <section className="card note-card">
          <header className="note-header">
            <h2>
              {"Notas: "}
              {format(selectedDate, "PPP", { locale: es })}
            </h2>
          </header>
          <div className="day-notes-list">
            <ul>
              {notasDelDia.map((nota) => {
                const tipoLabel = getTipoLabel(nota.tipo);
                const statusLabel = getStatusLabel(nota, notasDelDia);

                return (
                  <li key={nota.$id}>
                    <button
                      type="button"
                      className="day-note-item"
                      onClick={() => setNotaActiva(nota)}
                    >
                      <div className="day-note-top">
                        <span className="day-note-name">
                          {nota.texto || "Sin texto"}
                        </span>
                        <span className="day-note-time">
                          {formatInTimeZone(
                            nota.fecha,
                            "America/Mexico_City",
                            "HH:mm"
                          )}
                        </span>
                      </div>

                      {(tipoLabel || statusLabel) && (
                        <div className="day-note-tags">
                          {tipoLabel && (
                            <span className="tag tag-type">{tipoLabel}</span>
                          )}
                          {statusLabel && (
                            <span
                              className={
                                "tag tag-status " +
                                (statusLabel === "On Time"
                                  ? "tag-ok"
                                  : "tag-bad")
                              }
                            >
                              {statusLabel}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* MODAL DE NOTA */}
      {notaActiva && (
        <div
          className="nota-modal-backdrop"
          onClick={() => setNotaActiva(null)}
        >
          <div
            className="nota-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="nota-modal-header">
              <div>
                <h3 className="nota-modal-title">Detalle de la nota</h3>
                <div className="nota-modal-date">
                  {formatInTimeZone(
                    notaActiva.fecha,
                    "America/Mexico_City",
                    "PPP 'a las' HH:mm",
                    { locale: es }
                  )}
                </div>
              </div>
            </header>

            {/* DESCRIPCIÓN */}
            <div className="nota-modal-section">
              <h4 className="nota-section-title">Descripción</h4>
              <p className="nota-section-body">
                {notaActiva.texto || "Sin texto"}
              </p>
            </div>

            {/* ARCHIVOS */}
            <div className="nota-modal-section">
              <h4 className="nota-section-title">Archivos</h4>

              {!notaActiva.imagenId && !notaActiva.videoId ? (
                <p className="nota-section-body">Sin archivos</p>
              ) : (
                <div
                  className={
                    "nota-files-row " +
                    (notaActiva.imagenId && notaActiva.videoId
                      ? "nota-files-row--two"
                      : "nota-files-row--one")
                  }
                >
                  {notaActiva.imagenId && (
                    <div className="nota-file-card">
                      <span className="nota-file-title">Imagen</span>
                      <img
                        src={getImagePreviewUrl(notaActiva.imagenId)}
                        alt="Imagen adjunta"
                        className="nota-file-image"
                      />
                    </div>
                  )}

                  {notaActiva.videoId && (
                    <div className="nota-file-card">
                      <span className="nota-file-title">Video</span>
                      <video
                        className="nota-file-video"
                        controls
                      >
                        <source src={getVideoUrl(notaActiva.videoId)} />
                        Tu navegador no soporta video HTML5.
                      </video>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="nota-modal-actions">
              <Button
                color={primaryColor}
                type="button"
                onClick={() => setNotaActiva(null)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddNotaView;
