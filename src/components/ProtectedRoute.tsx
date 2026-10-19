
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({
  children,
}: {
  children: ReactNode;
}) {
  const { user, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="auth-loading">
        Verificando acceso a Dioses del Caos...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
