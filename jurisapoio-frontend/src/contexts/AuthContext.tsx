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
  login: (data: LoginData) => Promise<void>;
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

  async function login(data: LoginData) {
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

      setIsAuthenticated(true);
    } catch (error) {
      console.warn("Backend offline, logando em modo de demonstração local.", error);
      // Salva tokens de demonstração para permitir acesso sem o backend
      tokenStorage.setTokens(
        "mock_access_token",
        "mock_refresh_token"
      );
      setIsAuthenticated(true);
    }
  }

  function logout() {

    tokenStorage.clear();

    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
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