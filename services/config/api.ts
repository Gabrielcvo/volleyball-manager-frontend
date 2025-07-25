import axios from "axios";
import { deleteItem, getItem } from "../../app/utils/SecureStore";
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
  const token = await getItem("token");
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
      if (error.response?.data?.error) {
        showToast("error", error.response.data.error);
      } else if (error.response?.data?.message) {
        showToast("error", error.response.data.message);
      } else if (error.response?.status) {
        const statusMessages: Record<number, string> = {
          400: "Dados inválidos",
          401: "Não autorizado",
          403: "Acesso negado",
          404: "Recurso não encontrado",
          500: "Erro interno do servidor",
          502: "Servidor indisponível",
          503: "Serviço temporariamente indisponível",
        };
        const message =
          statusMessages[error.response.status] ||
          `Erro ${error.response.status}`;
        showToast("error", message);
      } else if (error.code === "ECONNABORTED") {
        showToast("error", "Tempo limite excedido");
      } else if (error.code === "ERR_NETWORK") {
        showToast("error", "Erro de conexão com o servidor");
      } else {
        showToast("error", "Ocorreu um erro inesperado");
      }
    }

    if (error.response?.status === 401) {
      // Token expirado ou inválido
      await deleteItem("token");
    }

    return Promise.reject(error);
  }
);

export default api;
