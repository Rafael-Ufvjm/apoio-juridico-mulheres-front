import api from "./api";
import type { MensagemResponse } from "../types/api.types";

export const mensagemService = {
  listarMensagens(casoId: string) {
    return api.get<MensagemResponse[]>(`/api/casos/${casoId}/mensagens`);
  },

  enviarMensagem(casoId: string, conteudo: string) {
    return api.post<MensagemResponse>(`/api/casos/${casoId}/mensagens`, { conteudo });
  }
};
