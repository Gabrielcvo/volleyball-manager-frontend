import api from "../config/api";

export interface User {
  id: number;
  nome: string;
  email: string;
  avatar_url?: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  usuario: User;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  avatar_url?: string;
}

const AuthService = {
  login: async (email: string, senha: string): Promise<LoginResponse> => {
    const response = await api.post("/auth/login", { email, senha });
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<{ message: string }> => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  fetchProfile: async (): Promise<{ usuario: User }> => {
    const response = await api.get("/auth/profile");
    return response.data;
  },
};

export default AuthService;
