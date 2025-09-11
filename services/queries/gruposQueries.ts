import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import GruposService, { CreateGrupoRequest } from "../api/grupos";
import { createInvalidationUtils } from "./invalidationUtils";

// Query Keys
export const gruposKeys = {
  all: ["grupos"] as const,
  lists: () => [...gruposKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...gruposKeys.lists(), filters] as const,
  details: () => [...gruposKeys.all, "detail"] as const,
  detail: (id: number) => [...gruposKeys.details(), id] as const,
  membros: () => [...gruposKeys.all, "membros"] as const,
  membrosList: (grupoId: number) => [...gruposKeys.membros(), grupoId] as const,
};

// Queries
export const useGrupos = () => {
  return useQuery({
    queryKey: gruposKeys.list({}),
    queryFn: () => GruposService.list(),
    select: (data) => data.grupos,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useGrupo = (grupoId: number) => {
  return useQuery({
    queryKey: gruposKeys.detail(grupoId),
    queryFn: () => GruposService.getById(grupoId),
    select: (data) => data.grupo,
    enabled: !!grupoId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMembrosGrupo = (grupoId: number) => {
  return useQuery({
    queryKey: gruposKeys.membrosList(grupoId),
    queryFn: () => GruposService.getMembros(grupoId),
    select: (data) => data.membros,
    enabled: !!grupoId,
    staleTime: 3 * 60 * 1000, // 3 minutos
  });
};

// Mutations
export const useCreateGrupo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGrupoRequest) => GruposService.create(data),
    onSuccess: () => {
      // Invalidar lista de grupos
      queryClient.invalidateQueries({ queryKey: gruposKeys.lists() });
    },
  });
};

export const useAddMembro = () => {
  const queryClient = useQueryClient();
  const invalidationUtils = createInvalidationUtils(queryClient);

  return useMutation({
    mutationFn: ({ grupoId, email }: { grupoId: number; email: string }) =>
      GruposService.addMembro(grupoId, email),
    onSuccess: (_, { grupoId }) => {
      // Usar função utilitária para invalidar membros
      invalidationUtils.invalidateMembros(grupoId);
    },
  });
};

export const useRemoveMembro = () => {
  const queryClient = useQueryClient();
  const invalidationUtils = createInvalidationUtils(queryClient);

  return useMutation({
    mutationFn: ({
      grupoId,
      jogadorId,
    }: {
      grupoId: number;
      jogadorId: number;
    }) => GruposService.removeMembro(grupoId, jogadorId),
    onSuccess: (_, { grupoId }) => {
      // Usar função utilitária para invalidar membros
      invalidationUtils.invalidateMembros(grupoId);
    },
  });
};
