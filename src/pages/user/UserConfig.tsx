// src/pages/user/UserConfig.tsx
import { useMemo } from "react";
import { Button, Input } from "waddle-ui";
import { useTheme } from "@/hooks/useTheme";
import { extractColorFromCssVar } from "@/utils/ExtractColorFromCssVar";
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

  const themeLabel = useMemo(
    () => (theme === "light" ? "Claro" : "Oscuro"),
    [theme]
  );

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
            Restablecer colores del tema {themeLabel}
          </Button>
        </footer>
      </section>
    </div>
  );
}
