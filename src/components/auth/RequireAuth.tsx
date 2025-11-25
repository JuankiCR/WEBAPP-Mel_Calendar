// src/components/auth/RequireAuth.tsx
import { useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { FullPageLoader } from "@/components/UI/FullPageLoader";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading, initialized, fetchUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!initialized) {
      fetchUser();
    }
  }, [initialized, fetchUser]);

  useEffect(() => {
    if (initialized && !loading && !user) {
      navigate("/login", { replace: true });
    }
  }, [initialized, loading, user, navigate]);

  if (!initialized || loading) {
    return <FullPageLoader message="Verificando tu sesión..." />;
  }

  if (!user) return null;

  return <>{children}</>;
}
