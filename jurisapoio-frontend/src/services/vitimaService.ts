import api from "./api";
import type { VitimaResponse } from "../types/api.types";

export const vitimaService = {
  obterPerfil() {
    return api.get<VitimaResponse>("/api/vitimas/perfil");
  },

  excluirConta() {
    return api.delete<void>("/api/vitimas/conta");
  }
};
