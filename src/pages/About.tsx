import React from "react";

import { useKonamiUniversalCode  } from "@/hooks/useKonamiCode";

const About: React.FC = () => {
  const playQuack = () => {
    const audio = new Audio("/duck.mp3");
    audio.play().catch((err) => {
      console.warn("🔇 No se pudo reproducir el cuack automáticamente:", err);
    });
  };

  useKonamiUniversalCode (() => {
    playQuack();
  });

  return (
    <>
      <div style={{ padding: "1.5rem", maxWidth: "600px", margin: "0 auto" }}>
        <h2 style={{ marginBottom: "1rem" }}>ℹ️ Sobre Waddle</h2>

        <p style={{ marginBottom: "1rem", color: "var(--text-secondary)" }}>
          <strong>Waddle</strong> es una aplicación web diseñada para ayudarte a organizar tu vida personal y financiera.
          Administra tus ingresos y gastos, separa tus metas de ahorro, y complementa tu productividad con un gestor de tareas integrado.
        </p>

        <div style={{ marginBottom: "2rem" }}>
          <h4 style={{ marginBottom: "0.5rem" }}>🔗 Repositorio</h4>
          <a
            href="https://github.com/Rubber-Duck-Enterprises/WEBAPP-Waddle"
            target="_blank"
            rel="noreferrer"
            style={{
              color: "var(--information-color)",
              wordBreak: "break-all",
              display: "inline-block",
              marginBottom: "0.5rem",
            }}
          >
            github.com/Rubber-Duck-Enterprises/WEBAPP-Waddle
          </a>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <h4>🛠 Tecnologías utilizadas</h4>
          <ul style={{ paddingLeft: "1.25rem", lineHeight: "1.7", color: "var(--text-secondary)" }}>
            <li>⚛️ React + Vite</li>
            <li>📱 Instalación como PWA</li>
            <li>📦 Zustand con persistencia local</li>
            <li>🎬 Framer Motion para animaciones</li>
          </ul>
        </div>
        
        <div style={{ marginBottom: "2rem", fontStyle: "italic", color: "var(--text-secondary)" }}>
          💡 Esta es una versión <strong>beta</strong>. Si tienes ideas, sugerencias o encuentras errores,
          ¡agradecemos tu feedback y contribuciones!
        </div>

        <p style={{ marginBottom: "1rem", textAlign: "center", color: "var(--text-secondary)" }}>
          Este proyecto fue desarrollado por el equipo de{" "}
          <a href="https://www.rbduck.com/" target="_blank" rel="noreferrer" style={{ color: "var(--information-color)" }}>
            rbduck.com
          </a>{" "}
          con el desarrollador principal{" "}
          <a href="https://juankicr.dev/" target="_blank" rel="noreferrer" style={{ color: "var(--information-color)" }}>
            Juanki CR
          </a>.
        </p>

      </div>
    </>
  );
};

export default About;
