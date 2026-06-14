import api from "./api";
import type {
  LoginRequest
} from "../types/auth.types";

export const authService = {

  login(data: LoginRequest) {
    return api.post(
      "/api/auth/login",
      data
    );
  },

  cadastrarVitima(data: unknown) {
    return api.post(
      "/api/auth/cadastro/vitima",
      data
    );
  },

  cadastrarAdvogado(data: unknown) {
    return api.post(
      "/api/auth/cadastro/advogado",
      data
    );
  }
};