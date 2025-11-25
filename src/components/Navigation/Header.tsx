// src/components/Header.tsx
import React, { useEffect } from "react";
import MenuButton from "./MenuButton";
import { UserMenu } from "waddle-ui";
import { useAuthStore } from "@/store/useAuthStore";
import { extractColorFromCssVar } from '@/utils/ExtractColorFromCssVar'

type Props = {
  onOpenMenu: () => void;
};

const Header: React.FC<Props> = ({ onOpenMenu }) => {
  const primaryColor = extractColorFromCssVar("--primary-color");
  const { user, loading, fetchUser, signOut } = useAuthStore();

  useEffect(() => {
    if (!user && !loading) {
      fetchUser();
    }
  }, [user, loading, fetchUser]);

  const username =
    user?.name || user?.email || "Invitado";

  const SesionContenido = () => (
    <div
      role="menuitem"
      onClick={signOut}
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '8px'
      }}
    >
      <span>⚠️</span>
      <span>Cerrar sesión</span>
      <span></span>
    </div>
  );

  const MenuSections = [
    { titulo: ' ꒰ঌ·✦·໒꒱ ', contenido: <SesionContenido /> },
  ];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem",
        borderBottom: "1px solid var(--border-color)",
        background: "var(--background)",
        color: "var(--text-primary)",
      }}
    >
      <MenuButton onClick={onOpenMenu} />

      <span style={{ fontWeight: "bold", fontSize: "1.5rem" }}>
        Calendario 📅
      </span>

      <UserMenu
        color={primaryColor}
        pfpSize="sm"
        username={username}
        sections={MenuSections}
      />
    </div>
  );
};

export default Header;
