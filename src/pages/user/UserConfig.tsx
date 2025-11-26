// src/pages/user/UserConfig.tsx
import { useEffect, useMemo } from "react";
import { Button, Input } from "waddle-ui";
import { useTheme } from "@/hooks/useTheme";
import { extractColorFromCssVar } from "@/utils/ExtractColorFromCssVar";
import { 
  getUserSettings,
  updateUserSettings,
  WorkingDay
} from "@/services/userSettings";
import { createPushToken } from "@/lib/firebase";

import "./UserConfig.css";

type EditableVar = {
  name: string;
  label: string;
  type: "color" | "text";
};

const JORNADA_VARS: EditableVar[] = [
  {
    name: "--hora-inicio-jornada",
    label: "Inicio de jornada (HH:mm)",
    type: "text",
  },
  {
    name: "--hora-fin-jornada",
    label: "Fin de jornada (HH:mm)",
    type: "text",
  },
  {
    name: "--hora-salida-comida-desde",
    label: "Salida comida DESDE (HH:mm)",
    type: "text",
  },
  {
    name: "--hora-salida-comida-hasta",
    label: "Salida comida HASTA (HH:mm)",
    type: "text",
  },
  {
    name: "--duracion-max-comida-min",
    label: "Duración máxima comida (minutos)",
    type: "text",
  },
];

const COLOR_VARS: EditableVar[] = [
  { name: "--primary-color", label: "Color principal", type: "color" },
  { name: "--background", label: "Fondo de la app", type: "color" },
  { name: "--surface", label: "Tarjetas / surface", type: "color" },
  { name: "--text-primary", label: "Texto principal", type: "color" },
  { name: "--text-secondary", label: "Texto secundario", type: "color" },
  { name: "--border-color", label: "Bordes", type: "color" },
  { name: "--success-color", label: "Color éxito", type: "color" },
  { name: "--danger-color", label: "Color error", type: "color" },
  {
    name: "--information-color",
    label: "Color información",
    type: "color",
  },
];

export default function UserConfig() {
  const primaryColor = extractColorFromCssVar("--primary-color");
  const { theme, toggleTheme, overrides, setThemeVar, resetThemeVars } =
    useTheme();

  const getVarValue = (name: string) => {
    if (overrides[name]) return overrides[name];
    if (typeof window !== "undefined") {
      const value = getComputedStyle(
        document.documentElement
      ).getPropertyValue(name);
      return value.trim() || "";
    }
    return "";
  };

  const handleEnableNotifications = async () => {
    try {
      const token = await createPushToken();

      await updateUserSettings({ fcmToken: token });

      console.log("✅ Notificaciones activadas, token guardado");
      alert("Notificaciones activadas ✅");
    } catch (err: any) {
      console.error("Error activando notificaciones", err);
      alert(
        err?.message ||
          "No se pudieron activar las notificaciones. Revisa la consola."
      );
    }
  };

  const themeLabel = useMemo(
    () => (theme === "light" ? "Claro" : "Oscuro"),
    [theme]
  );

  // Cargar settings desde Appwrite (solo una vez al montar)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const settings = await getUserSettings();
        if (cancelled) return;

        // workingDay -> CSS vars
        if (settings.workingDay) {
          const wd = JSON.parse(settings.workingDay) as WorkingDay;

          if (wd.start)
            setThemeVar("--hora-inicio-jornada", wd.start);
          if (wd.end)
            setThemeVar("--hora-fin-jornada", wd.end);
          if (wd.lunchOutFrom)
            setThemeVar("--hora-salida-comida-desde", wd.lunchOutFrom);
          if (wd.lunchOutTo)
            setThemeVar("--hora-salida-comida-hasta", wd.lunchOutTo);
          if (wd.maxLunchMinutes != null)
            setThemeVar(
              "--duracion-max-comida-min",
              String(wd.maxLunchMinutes)
            );
        }

        // themeOverrides -> CSS vars
        if (settings.themeOverrides) {
          const parsed = JSON.parse(settings.themeOverrides) as Record<
            string,
            string
          >;
          Object.entries(parsed).forEach(([name, value]) =>
            setThemeVar(name, value)
          );
        }
      } catch (err) {
        console.error("Error cargando user_settings", err);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guardar en Appwrite
  const handleSave = async () => {
    try {
      const workingDay: WorkingDay = {
        start: getVarValue("--hora-inicio-jornada") || undefined,
        end: getVarValue("--hora-fin-jornada") || undefined,
        lunchOutFrom: getVarValue("--hora-salida-comida-desde") || undefined,
        lunchOutTo: getVarValue("--hora-salida-comida-hasta") || undefined,
        maxLunchMinutes: Number(
          getVarValue("--duracion-max-comida-min") || "0"
        ) || undefined,
      };

      await updateUserSettings({
        workingDay: JSON.stringify(workingDay),
        themeOverrides: JSON.stringify(overrides ?? {}),
      });

      alert("Configuración guardada ✅");
    } catch (err) {
      console.error(err);
      alert("Error al guardar configuración");
    }
  };

  return (
    <div className="settings-page">
      <section className="card settings-card">
        <header className="settings-header">
          <div>
            <h1>Configuración</h1>
            <p className="settings-subtitle">
              Ajusta tu jornada y la apariencia de la app.
            </p>
          </div>

          <div className="theme-toggle">
            <span className="theme-label">Tema actual: {themeLabel}</span>
            <Button
              color={primaryColor}
              type="button"
              onClick={toggleTheme}
            >
              Cambiar a {theme === "light" ? "oscuro" : "claro"}
            </Button>
          </div>
        </header>

        {/* 🕒 Bloque Jornada */}
        <div className="settings-section">
          <h2 className="settings-section-title">Jornada</h2>
          <div className="settings-content">
            {JORNADA_VARS.map((v) => {
              const value = getVarValue(v.name);

              return (
                <div key={v.name} className="settings-row">
                  <label className="settings-label">
                    {v.label}
                    <Input
                      color={primaryColor}
                      type="text"
                      value={value}
                      onChange={(e: any) => setThemeVar(v.name, e.target.value)}
                      placeholder={
                        v.name === "--duracion-max-comida-min"
                          ? "Ej: 60"
                          : "Ej: 08:00"
                      }
                    />
                  </label>
                  <span className="settings-var-name">{v.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="settings-section">
          <Button
            color={primaryColor}
            type="button"
            onClick={handleEnableNotifications}
            fullWidth
          >
            Activar notificaciones
          </Button>
        </div>

        {/* 🎨 Bloque Colores / Apariencia */}
        <div className="settings-section">
          <h2 className="settings-section-title">Colores</h2>
          <div className="settings-content">
            {COLOR_VARS.map((v) => {
              const raw = getVarValue(v.name);
              const value = raw || "#ffffff";

              return (
                <div key={v.name} className="settings-row">
                  <label className="settings-label">
                    {v.label}
                    <input
                      className="settings-color-input"
                      type="color"
                      value={value.startsWith("#") ? value : "#ffffff"}
                      onChange={(e) => setThemeVar(v.name, e.target.value)}
                    />
                  </label>
                  <span className="settings-var-name">{v.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        <footer className="settings-footer">
          <Button
            color={primaryColor}
            type="button"
            variant="ghost"
            onClick={resetThemeVars}
          >
            Restablecer tema {themeLabel}
          </Button>

          <Button
            color={primaryColor}
            type="button"
            onClick={handleSave}
          >
            Guardar
          </Button>
        </footer>
      </section>
    </div>
  );
}