import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import env from "../../common/config/env";

const api = axios.create({
  baseURL: env.apiUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Função para mostrar toast - será definida quando o contexto estiver disponível
let showToast:
  | ((type: "success" | "error" | "info" | "warning", message: string) => void)
  | null = null;

export const setToastFunction = (
  toastFunction: (
    type: "success" | "error" | "info" | "warning",
    message: string
  ) => void
) => {
  showToast = toastFunction;
};

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratamento de erros e sucesso com toast
api.interceptors.response.use(
  (response) => {
    // Mostrar toast de sucesso se houver mensagem
    if (response.data?.message && showToast) {
      showToast("success", response.data.message);
    }
    return response;
  },
  async (error) => {
    // Tratamento de erros com toast
    if (showToast) {
      if (error.response?.data?.message) {
        showToast("error", error.response.data.message);
      } else if (error.message) {
        showToast("error", `Erro de conexão: ${error.message}`);
      } else {
        showToast("error", "Ocorreu um erro inesperado.");
      }
    }

    if (error.response?.status === 401) {
      // Token expirado ou inválido
      await AsyncStorage.removeItem("token");
      // Redirecionar para a tela de login se necessário
    }

    return Promise.reject(error);
  }
);

export default api;
