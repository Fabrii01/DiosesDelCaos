import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Dashboard from "./pages/Dashboard";
import Inventario from "./pages/Inventario";
import Movimientos from "./pages/Movimientos";
import Tesoreria from "./pages/Tesoreria";
import Historial from "./pages/Historial";
import Usuarios from "./pages/Usuarios";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./components/AuthContext";

function LoginRoute() {
  const { user, cargando } = useAuth();

  if (cargando) {
    return <div className="auth-loading">Verificando sesión...</div>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Login />;
}

function RegistroRoute() {
  const { user, cargando } = useAuth();

  if (cargando) {
    return <div className="auth-loading">Verificando sesión...</div>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Registro />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/registro" element={<RegistroRoute />} />

          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventario" element={<Inventario />} />
            <Route path="/movimientos" element={<Movimientos />} />
            <Route path="/tesoreria" element={<Tesoreria />} />
            <Route path="/historial" element={<Historial />} />
            <Route path="/usuarios" element={<Usuarios />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}