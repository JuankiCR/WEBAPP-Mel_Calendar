import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Button
} from "waddle-ui"
import UIToggle from "@/components/UI/UIToggle";
import DrawerLink from "./DrawerLink";
import { useTheme } from "@/hooks/useTheme";
import { extractColorFromCssVar } from "@/utils/ExtractColorFromCssVar";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const Drawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const primaryColor = extractColorFromCssVar("--primary-color");
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === "accepted") {
        console.log("PWA instalada");
      }
      setDeferredPrompt(null);
    }
  };

  const handleNavigate = (path: string) => {
    if (location.pathname !== path) {
      navigate(path);
    }
    onClose();
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: isOpen ? 0 : "-250px",
          width: "250px",
          height: "100%",
          backgroundColor: "var(--background)",
          boxShadow: "2px 0 8px rgba(0, 0, 0, 0.1)",
          transition: "left 0.3s ease-in-out, background-color 0.3s ease-in-out",
          zIndex: 1000,
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h2 style={{ color: "var(--text-primary)" }}>Menú</h2>
          <div
            style={{
              backgroundColor: "var(--border-color)",
              margin: "1rem 0",
              height: "1px",
              width: "100%",
            }}
          />

          <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <DrawerLink path="/home" label="📅 Calendario" onClick={handleNavigate} />
            <DrawerLink path="/user/config" label="⚙️ Configuración" onClick={handleNavigate} />
            <DrawerLink path="/about" label="ℹ️ Sobre Waddle" onClick={handleNavigate} />
          </ul>
        </div>

        <div>
          {deferredPrompt && (
            <div style={{ marginTop: "1rem" }}>
              <Button
                color={primaryColor}
                onClick={handleInstallClick}
                fullWidth
              >
                📲 Instalar app
              </Button>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              margin: "1rem 0",
            }}
          >
            <UIToggle
              label={theme === "light" ? "🌞 Claro" : "🌚 Oscuro"}
              checked={theme === "dark"}
              onChange={toggleTheme}
            />
          </div>

          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--text-secondary)",
              textAlign: "center",
            }}
          >
            v{__APP_VERSION__}
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.3)",
            zIndex: 999,
          }}
        />
      )}
    </>
  );
};

export default Drawer;
