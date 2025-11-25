// src/pages/StartRedirect.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { FullPageLoader } from "@/components/UI/FullPageLoader";

export default function StartRedirect() {
  const { user, initialized, fetchUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!initialized) {
      fetchUser();
      return;
    }

    if (user) {
      navigate("/home", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [initialized, user, fetchUser, navigate]);

  return <FullPageLoader message="Preparando tu espacio..." />;
}
