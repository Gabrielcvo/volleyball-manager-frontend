import api from "../config/api";
import { Service } from "../config/apiPublic";

export interface User {
  id: number;
  nome: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  usuario: User;
}

const AuthService = {
  login: (email: string, senha: string) =>
    Service<LoginResponse>(api.post("auth/login", { email, senha })),

  register: (nome: string, email: string, senha: string) =>
    Service<any>(api.post("auth/register", { nome, email, senha })),

  fetchProfile: () => Service<{ usuario: User }>(api.get("auth/profile")),
};

export default AuthService;
