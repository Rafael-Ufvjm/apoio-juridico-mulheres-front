import api from "./api";
import type { CasoResponse, CasoTriagemRequest, EncerrarCasoRequest } from "../types/api.types";

export const casoService = {
  abrirCaso(request: CasoTriagemRequest) {
    return api.post<CasoResponse>("/api/casos", request);
  },

  buscarPorId(id: string) {
    return api.get<CasoResponse>(`/api/casos/${id}`);
  },

  listarCasosDaVitima() {
    return api.get<CasoResponse[]>("/api/casos/meus");
  },

  encerrarCaso(id: string, request: EncerrarCasoRequest) {
    return api.put<CasoResponse>(`/api/casos/${id}/encerrar`, request);
  },

  atribuirAdvogado(id: string, advogadoId: string) {
    return api.put<CasoResponse>(`/api/casos/${id}/advogado/${advogadoId}`);
  }
};
