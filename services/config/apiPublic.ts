import axios, { AxiosError, AxiosResponse } from "axios";
import env from "../../common/config/env";
import ApiError from "../../common/types";

const apiPublic = axios.create({
  baseURL: `${env.apiUrl}/`,
});

// Função para mostrar toast - será definida quando o contexto estiver disponível
let showToast:
  | ((type: "success" | "error" | "info" | "warning", message: string) => void)
  | null = null;

export const setToastFunctionPublic = (
  toastFunction: (
    type: "success" | "error" | "info" | "warning",
    message: string
  ) => void
) => {
  showToast = toastFunction;
};

// Interceptor para tratamento de respostas com toast
apiPublic.interceptors.response.use(
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

    return Promise.reject(error);
  }
);

export const defaultErrorMessage = "Não foi possível conectar com o servidor";

export async function Service<T extends object | undefined = undefined>(
  promise: Promise<AxiosResponse<T>>
) {
  return promise
    .then((res) => res.data)
    .catch((error: AxiosError<{ error: object; message: string }>) => {
      throw new ApiError(
        error.response?.data?.message ??
          "Não foi possível conectar com o servidor",
        error.response?.status,
        error.response?.data?.error
      );
    });
}

export default apiPublic;
