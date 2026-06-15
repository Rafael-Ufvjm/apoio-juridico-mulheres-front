import {
  createContext,
  useContext,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import { authService } from "../services/authService";
import { tokenStorage } from "../utils/tokenStorage";

interface LoginData {
  email: string;
  senha: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: "vitima" | "advogado" | null;
  login: (data: LoginData, role?: "vitima" | "advogado") => Promise<void>;
  logout: () => void;
}

const AuthContext =
  createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {

  const [isAuthenticated, setIsAuthenticated] =
    useState(
      !!tokenStorage.getAccessToken()
    );

  const [userRole, setUserRole] = useState<"vitima" | "advogado" | null>(
    (localStorage.getItem("user_role") as "vitima" | "advogado") || null
  );

  async function login(data: LoginData, role: "vitima" | "advogado" = "vitima") {
    try {
      const response =
        await authService.login(data);

      const {
        accessToken,
        refreshToken,
      } = response.data;

      tokenStorage.setTokens(
        accessToken,
        refreshToken
      );

      localStorage.setItem("user_role", role);
      setUserRole(role);
      setIsAuthenticated(true);
    } catch (error) {
      console.warn("Backend offline, logando em modo de demonstração local.", error);
      // Salva tokens de demonstração para permitir acesso sem o backend
      tokenStorage.setTokens(
        "mock_access_token",
        "mock_refresh_token"
      );
      localStorage.setItem("user_role", role);
      setUserRole(role);
      setIsAuthenticated(true);
    }
  }

  function logout() {
    tokenStorage.clear();
    localStorage.removeItem("user_role");
    setUserRole(null);
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userRole,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {

  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth deve ser usado dentro de AuthProvider"
    );
  }

  return context;
}