// components/UI/Toggle.tsx
import React from "react";

interface Props {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

const UIToggle: React.FC<Props> = ({ label, checked, onChange }) => (
  <label
    style={{
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      cursor: "pointer",
      fontSize: "0.9rem",
      userSelect: "none",
    }}
  >
    <span>{label}</span>
    <div
      style={{
        position: "relative",
        width: "40px",
        height: "20px",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{
          opacity: 0,
          width: "100%",
          height: "100%",
          position: "absolute",
          margin: 0,
          cursor: "pointer",
        }}
      />
      <span
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: checked ? "var(--primary-color)" : "var(--text-secondary)",
          borderRadius: "999px",
          transition: "0.3s",
        }}
      />
      <span
        style={{
          position: "absolute",
          top: "2px",
          left: checked ? "22px" : "2px",
          width: "16px",
          height: "16px",
          backgroundColor: "var(--background)",
          borderRadius: "50%",
          transition: "0.3s",
        }}
      />
    </div>
  </label>
);

export default UIToggle;
