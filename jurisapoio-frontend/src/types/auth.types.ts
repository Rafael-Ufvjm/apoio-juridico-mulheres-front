export interface LoginRequest {
  email: string;
  senha: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  perfil: "VITIMA" | "ADVOGADO_VOLUNTARIO" | "ADMIN";
  identificador: string;
}