// src/components/ui/FullPageLoader.tsx
import "./FullPageLoader.css";

type FullPageLoaderProps = {
  message?: string;
};

export function FullPageLoader({ message = "Cargando..." }: FullPageLoaderProps) {
  return (
    <div className="fullpage-loader">
      <div className="fullpage-loader-card">
        <div className="fullpage-loader-spinner" />
        <div className="fullpage-loader-content">
          <h2 className="fullpage-loader-title">📅 Calendario</h2>
          <p className="fullpage-loader-text">{message}</p>
        </div>
      </div>
    </div>
  );
}
