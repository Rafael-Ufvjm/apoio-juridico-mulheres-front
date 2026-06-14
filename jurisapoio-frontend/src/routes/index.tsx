import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { Login } from "../pages/auth/Login";
import { DashboardVitima } from "../pages/vitima/DashboardVitima";

import {
  ProtectedRoute,
} from "./ProtectedRoute";

export function AppRoutes() {

  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardVitima />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}