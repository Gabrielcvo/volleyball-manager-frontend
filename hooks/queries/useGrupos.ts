import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import GruposService, {
  CreateGrupoRequest,
  Grupo,
  MembroGrupo,
} from "../../services/api/grupos";
import { queryKeys } from "../../services/config/queryClient";
import { useInvalidations } from "./useInvalidations";

// Hook para listar grupos do usuário
export const useGrupos = () => {
  return useQuery({
    queryKey: queryKeys.grupos,
    queryFn: async (): Promise<Grupo[]> => {
      const response = await GruposService.list();
      return response.grupos;
    },
  });
};

// Hook para buscar detalhes de um grupo específico
export const useGrupo = (grupoId: number | null) => {
  const key = grupoId ? queryKeys.grupo(grupoId) : ["grupos", "disabled"];
  return useQuery({
    queryKey: key,
    queryFn: async (): Promise<Grupo> => {
      const response = await GruposService.getById(grupoId!);
      return response.grupo;
    },
    enabled: !!grupoId, // Só executa se grupoId estiver definido
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

// Hook para buscar membros de um grupo
export const useGrupoMembros = (grupoId: number | null) => {
  const key = grupoId
    ? queryKeys.grupoMembros(grupoId)
    : ["grupos", "membros", "disabled"];
  return useQuery({
    queryKey: key,
    queryFn: async (): Promise<MembroGrupo[]> => {
      const response = await GruposService.getMembros(grupoId!);
      return response.membros;
    },
    enabled: !!grupoId,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

// Hook para criar grupo
export const useCreateGrupo = () => {
  const queryClient = useQueryClient();
  const invalidations = useInvalidations();

  return useMutation({
    mutationFn: async (
      data: CreateGrupoRequest
    ): Promise<{ message: string; grupo: Grupo }> => {
      return await GruposService.create(data);
    },
    onSuccess: (data) => {
      // Adiciona o novo grupo ao cache
      queryClient.setQueryData(queryKeys.grupo(data.grupo.id), data.grupo);

      // Invalida a lista de grupos para refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.grupos });

      // Pré-carrega dados relacionados ao novo grupo
      invalidations.prefetchGrupoData(data.grupo.id);
    },
  });
};

// Hook para adicionar membro ao grupo
export const useAddMembroGrupo = () => {
  const invalidations = useInvalidations();

  return useMutation({
    mutationFn: async ({
      grupoId,
      email,
    }: {
      grupoId: number;
      email: string;
    }): Promise<{ message: string; membro: MembroGrupo }> => {
      return await GruposService.addMembro(grupoId, email);
    },
    onSuccess: (data, variables) => {
      // Invalida tudo relacionado ao grupo
      invalidations.invalidateGrupo(variables.grupoId);
    },
  });
};

// Hook para remover membro do grupo
export const useRemoveMembroGrupo = () => {
  const invalidations = useInvalidations();

  return useMutation({
    mutationFn: async ({
      grupoId,
      jogadorId,
    }: {
      grupoId: number;
      jogadorId: number;
    }): Promise<{ message: string }> => {
      return await GruposService.removeMembro(grupoId, jogadorId);
    },
    onSuccess: (data, variables) => {
      // Invalida tudo relacionado ao grupo
      invalidations.invalidateGrupo(variables.grupoId);
    },
  });
};
