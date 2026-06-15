import api from "./api";
import type {
  LoginRequest,
  AuthResponse
} from "../types/auth.types";

export const authService = {

  login(data: LoginRequest) {
    return api.post<AuthResponse>(
      "/api/auth/login",
      data
    );
  },

  cadastrarVitima(data: unknown) {
    return api.post<AuthResponse>(
      "/api/auth/cadastro/vitima",
      data
    );
  },

  cadastrarAdvogado(data: unknown) {
    return api.post<AuthResponse>(
      "/api/auth/cadastro/advogado",
      data
    );
  }
};