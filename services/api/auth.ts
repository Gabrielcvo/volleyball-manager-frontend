import api from "../config/api";

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
  login: async (email: string, senha: string): Promise<LoginResponse> => {
    const response = await api.post("auth/login", { email, senha });
    return response.data;
  },

  register: async (
    nome: string,
    email: string,
    senha: string
  ): Promise<any> => {
    const response = await api.post("auth/register", { nome, email, senha });
    return response.data;
  },

  fetchProfile: async (): Promise<{ usuario: User }> => {
    const response = await api.get("auth/profile");
    return response.data;
  },
};

export default AuthService;
