import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AuthService, { LoginResponse, RegisterRequest } from "../api/auth";

// Query Keys
export const authKeys = {
  all: ["auth"] as const,
  profile: () => [...authKeys.all, "profile"] as const,
};

// Queries
export const useProfile = () => {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: () => AuthService.fetchProfile(),
    select: (data) => data.usuario,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Mutations
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, senha }: { email: string; senha: string }) =>
      AuthService.login(email, senha),
    onSuccess: (data: LoginResponse) => {
      // Invalidar e refetch do perfil após login
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
      // Setar dados do usuário no cache
      queryClient.setQueryData(authKeys.profile(), data.usuario);
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterRequest) => AuthService.register(data),
  });
};
