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

const INITIAL_LAWYERS = [
  {
    id: 1,
    name: "Dra. Carla Mendes",
    email: "carla@oab.org",
    senha: "123",
    oab: "187.432",
    uf: "SP",
    specialties: ["Violência Doméstica", "Medida Protetiva"],
    seal: "Advogada Voluntária Verificada",
    experience: "12 anos",
    cases: "340+",
    rating: "⭐ 4.9",
    availability: "24–48h",
    color: "var(--wine)",
    gradient: "linear-gradient(135deg, var(--wine3), var(--wine))",
    status: "approved"
  },
  {
    id: 2,
    name: "Dr. Rafael Silva",
    email: "rafael@oab.org",
    senha: "123",
    oab: "213.567",
    uf: "RJ",
    specialties: ["Direito de Família", "Guarda de Filhos"],
    seal: "Advogado Voluntário Verificado",
    experience: "8 anos",
    cases: "210+",
    rating: "⭐ 4.8",
    availability: "12–24h",
    color: "var(--green)",
    gradient: "linear-gradient(135deg, #0d3a2e, #1a5c3a)",
    status: "approved"
  },
  {
    id: 3,
    name: "Dra. Paula Lima",
    email: "paula@oab.org",
    senha: "123",
    oab: "142.890",
    uf: "MG",
    specialties: ["Direito Penal", "Lei Maria da Penha"],
    seal: "Advogada Voluntária Verificada",
    experience: "15 anos",
    cases: "520+",
    rating: "⭐ 5.0",
    availability: "24h",
    color: "var(--blue)",
    gradient: "linear-gradient(135deg, #1a2a4a, #1e4d8c)",
    status: "approved"
  },
  {
    id: 4,
    name: "Dra. Fernanda Costa",
    email: "fernanda@oab.org",
    senha: "123",
    oab: "98.123",
    uf: "BA",
    specialties: ["Violência Psicológica", "Divórcio"],
    seal: "Advogada Voluntária Verificada",
    experience: "10 anos",
    cases: "280+",
    rating: "⭐ 4.7",
    availability: "48h",
    color: "#7a3a0a",
    gradient: "linear-gradient(135deg, #3a1a00, #7a3a0a)",
    status: "approved"
  },
  {
    id: 5,
    name: "Dr. Bruno Alencar",
    email: "bruno@oab.org",
    senha: "123",
    oab: "254.912",
    uf: "SP",
    specialties: ["Medida Protetiva", "Violência Doméstica"],
    seal: "Aguardando Verificação",
    experience: "4 anos",
    cases: "15",
    rating: "⭐ 4.5",
    availability: "24h",
    color: "var(--wine)",
    gradient: "linear-gradient(135deg, var(--wine3), var(--wine))",
    status: "pending"
  },
  {
    id: 6,
    name: "Dra. Mariana Souza",
    email: "mariana@oab.org",
    senha: "123",
    oab: "301.442",
    uf: "MG",
    specialties: ["Direito de Família"],
    seal: "Aguardando Verificação",
    experience: "6 anos",
    cases: "42",
    rating: "⭐ 4.6",
    availability: "48h",
    color: "var(--green)",
    gradient: "linear-gradient(135deg, #0d3a2e, #1a5c3a)",
    status: "pending"
  }
];

if (!localStorage.getItem("juris_lawyers")) {
  localStorage.setItem("juris_lawyers", JSON.stringify(INITIAL_LAWYERS));
}

interface LoginData {
  email: string;
  senha: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: "vitima" | "advogado" | "admin" | null;
  login: (data: LoginData, role?: "vitima" | "advogado" | "admin") => Promise<void>;
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

  const [userRole, setUserRole] = useState<"vitima" | "advogado" | "admin" | null>(
    (localStorage.getItem("user_role") as "vitima" | "advogado" | "admin") || null
  );

  async function login(data: LoginData, role: "vitima" | "advogado" | "admin" = "vitima") {
    try {
      // Se for admin simulado local, ou advogado/vitima simulado
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
    localStorage.removeItem("logged_lawyer_email");
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