import api from "./api";
import type { AdvogadoResponse, CasoResponse, Disponibilidade } from "../types/api.types";

export const advogadoService = {
  listarAtivos() {
    return api.get<AdvogadoResponse[]>("/api/advogados");
  },

  obterPerfil() {
    return api.get<AdvogadoResponse>("/api/advogados/perfil");
  },

  atualizarDisponibilidade(disponibilidade: Disponibilidade) {
    return api.put<AdvogadoResponse>(`/api/advogados/disponibilidade`, null, {
      params: { disponibilidade }
    });
  },

  listarCasos() {
    return api.get<CasoResponse[]>("/api/advogados/casos");
  }
};
