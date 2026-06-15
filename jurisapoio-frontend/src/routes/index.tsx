import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { Layout } from "../components/Layout";
import { Home } from "../pages/Home";
import { Lawyers } from "../pages/Lawyers";
import { Orientacao } from "../pages/Orientacao";
import { Sobre } from "../pages/Sobre";
import { Login } from "../pages/auth/Login";
import { DashboardVitima } from "../pages/vitima/DashboardVitima";
import { ChatSeguro } from "../pages/vitima/ChatSeguro";
import { DashboardAdvogado } from "../pages/advogado/DashboardAdvogado";
import { DashboardAdmin } from "../pages/admin/DashboardAdmin";

import {
  ProtectedRoute,
} from "./ProtectedRoute";

export function AppRoutes() {

  return (
    <BrowserRouter>

      <Routes>

        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/lawyers" element={<Lawyers />} />
          <Route path="/orientacao" element={<Orientacao />} />
          <Route path="/sobre" element={<Sobre />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardVitima />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard-advogado"
            element={
              <ProtectedRoute>
                <DashboardAdvogado />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard-admin"
            element={
              <ProtectedRoute>
                <DashboardAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatSeguro />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route
          path="/login"
          element={<Login />}
        />

      </Routes>

    </BrowserRouter>
  );
}