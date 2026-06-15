import api from "./api";
import type { AdvogadoResponse, AprovarAdvogadoRequest } from "../types/api.types";

export const adminService = {
  listarAdvogadosPendentes() {
    return api.get<AdvogadoResponse[]>("/api/admin/advogados/pendentes");
  },

  processarAprovacao(id: string, request: AprovarAdvogadoRequest) {
    return api.put<AdvogadoResponse>(`/api/admin/advogados/${id}/aprovar`, request);
  }
};
