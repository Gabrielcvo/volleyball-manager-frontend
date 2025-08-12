import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AuthService, {
  LoginResponse,
  RegisterRequest,
  User,
} from "../../services/api/auth";
import {
  invalidateQueries,
  queryKeys,
} from "../../services/config/queryClient";

// Hook para buscar perfil do usuário
export const useProfile = () => {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: async (): Promise<User> => {
      const response = await AuthService.fetchProfile();
      return response.usuario;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos - perfil muda raramente
  });
};

// Hook para login
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      senha,
    }: {
      email: string;
      senha: string;
    }): Promise<LoginResponse> => {
      return await AuthService.login(email, senha);
    },
    onSuccess: (data) => {
      // Armazena os dados do usuário no cache
      queryClient.setQueryData(queryKeys.profile, data.usuario);
    },
  });
};

// Hook para registro
export const useRegister = () => {
  return useMutation({
    mutationFn: async (data: RegisterRequest): Promise<{ message: string }> => {
      return await AuthService.register(data);
    },
  });
};

// Hook para invalidar dados do perfil (útil para logout)
export const useInvalidateProfile = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.removeQueries({ queryKey: queryKeys.profile });
    invalidateQueries.profile();
  };
};

