import { useMutation, useQuery } from "@tanstack/react-query";
import PartidasService, {
  ConfirmacoesPartida,
  CreatePartidaRequest,
  Partida,
  PartidaDetalhes,
  StatusPartida,
  UpdatePartidaRequest,
} from "../../services/api/partidas";
import {
  invalidateQueries,
  queryKeys,
} from "../../services/config/queryClient";

// Hook para listar partidas de um grupo
export const usePartidas = (
  grupoId: number | null,
  params?: { status?: StatusPartida; futuras?: boolean }
) => {
  const key = grupoId
    ? [...queryKeys.partidas, grupoId, params]
    : ["partidas", "lista", "disabled", params];
  return useQuery({
    queryKey: key,
    queryFn: async (): Promise<Partida[]> => {
      const response = await PartidasService.list(grupoId!, params);
      return response.partidas;
    },
    enabled: !!grupoId,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

// Hook para buscar detalhes de uma partida específica
export const usePartida = (partidaId: number | null) => {
  return useQuery({
    queryKey: queryKeys.partida(partidaId!),
    queryFn: async (): Promise<Partida> => {
      const response = await PartidasService.getById(partidaId!);
      return response.partida;
    },
    enabled: !!partidaId,
  });
};

// Hook para buscar detalhes completos de uma partida
export const usePartidaDetalhes = (partidaId: number | null) => {
  const key = partidaId
    ? [...queryKeys.partida(partidaId), "detalhes"]
    : ["partidas", "detalhes", "disabled"];
  return useQuery({
    queryKey: key,
    queryFn: async (): Promise<PartidaDetalhes> => {
      return await PartidasService.getDetalhes(partidaId!);
    },
    enabled: !!partidaId,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

// Hook para buscar confirmações de uma partida
export const usePartidaConfirmacoes = (partidaId: number | null) => {
  const key = partidaId
    ? [...queryKeys.partida(partidaId), "confirmacoes"]
    : ["partidas", "confirmacoes", "disabled"];
  return useQuery({
    queryKey: key,
    queryFn: async (): Promise<ConfirmacoesPartida> => {
      return await PartidasService.getConfirmacoes(partidaId!);
    },
    enabled: !!partidaId,
    staleTime: 2 * 60 * 1000, // 2 minutos - confirmações mudam frequentemente
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

// Hook para criar partida
export const useCreatePartida = () => {
  return useMutation({
    mutationFn: async ({
      grupoId,
      data,
    }: {
      grupoId: number;
      data: CreatePartidaRequest;
    }): Promise<{ message: string; partida: Partida }> => {
      return await PartidasService.create(grupoId, data);
    },
    onSuccess: (data, variables) => {
      // Invalida as partidas do grupo para refetch
      invalidateQueries.partidas();

      // Invalida o grupo para atualizar contadores
      invalidateQueries.grupo(variables.grupoId);
    },
  });
};

// Hook para atualizar partida
export const useUpdatePartida = () => {
  return useMutation({
    mutationFn: async ({
      partidaId,
      data,
    }: {
      partidaId: number;
      data: UpdatePartidaRequest;
    }): Promise<{ message: string; partida: Partida }> => {
      return await PartidasService.update(partidaId, data);
    },
    onSuccess: (data, variables) => {
      // Invalida a partida específica
      invalidateQueries.partida(variables.partidaId);

      // Invalida a lista de partidas
      invalidateQueries.partidas();
    },
  });
};

// Hook para confirmar presença
export const useConfirmarPresenca = () => {
  return useMutation({
    mutationFn: async ({
      partidaId,
      status,
    }: {
      partidaId: number;
      status: "confirmado" | "nao_confirmado";
    }): Promise<any> => {
      return await PartidasService.confirmarPresenca(partidaId, status);
    },
    onSuccess: (data, variables) => {
      // Invalida a partida e suas confirmações
      invalidateQueries.partida(variables.partidaId);

      // Invalida a lista de partidas para atualizar contadores
      invalidateQueries.partidas();
    },
  });
};
