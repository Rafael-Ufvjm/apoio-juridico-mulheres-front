export type Disponibilidade = "ONLINE" | "OFFLINE" | "OCUPADO";
export type StatusAprovacao = "PENDENTE" | "ATIVO" | "RECUSADO";
export type StatusCaso = "AGUARDANDO" | "EM_ATENDIMENTO" | "ENCERRADO" | "ARQUIVADO";
export type TipoViolencia = "FISICA" | "PSICOLOGICA" | "SEXUAL" | "PATRIMONIAL" | "MORAL";

export interface VitimaResponse {
  id: string;
  nomeAnonimo: string;
  estadoResidencia: string;
  dataCadastro: string;
}

export interface AdvogadoResponse {
  id: string;
  nome: string;
  numeroOAB: string;
  statusAprovacao: StatusAprovacao;
  especialidades: string;
  disponibilidade: Disponibilidade;
  dataAprovacao?: string;
}

export interface CasoResponse {
  id: string;
  protocolo: string;
  tipoViolencia: TipoViolencia;
  status: StatusCaso;
  timestampAbertura: string;
  timestampEncerramento?: string;
  resultado?: string;
  vitima?: VitimaResponse;
  advogado?: AdvogadoResponse;
}

export interface MensagemResponse {
  id: string;
  remetentePerfil: "VITIMA" | "ADVOGADO_VOLUNTARIO" | "ADMIN";
  conteudo: string;
  dataEnvio: string;
  conteudoRemovido: boolean;
}

export interface CasoTriagemRequest {
  tipoViolencia: TipoViolencia;
  descricao: string;
}

export interface AprovarAdvogadoRequest {
  aprovado: boolean;
  justificativa?: string;
}

export interface EncerrarCasoRequest {
  resultado: string;
}
