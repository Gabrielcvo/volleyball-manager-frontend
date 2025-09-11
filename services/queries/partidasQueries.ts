import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PartidasService, {
  CreatePartidaRequest,
  StatusPartida,
  UpdatePartidaRequest,
} from "../api/partidas";
import { createInvalidationUtils } from "./invalidationUtils";

// Query Keys
export const partidasKeys = {
  all: ["partidas"] as const,
  lists: () => [...partidasKeys.all, "list"] as const,
  list: (grupoId: number, filters?: Record<string, any>) =>
    [...partidasKeys.lists(), grupoId, filters] as const,
  details: () => [...partidasKeys.all, "detail"] as const,
  detail: (id: number) => [...partidasKeys.details(), id] as const,
  confirmacoes: () => [...partidasKeys.all, "confirmacoes"] as const,
  confirmacoesList: (partidaId: number) =>
    [...partidasKeys.confirmacoes(), partidaId] as const,
};

// Queries
export const usePartidas = (
  grupoId: number,
  filters?: { status?: StatusPartida; futuras?: boolean }
) => {
  return useQuery({
    queryKey: partidasKeys.list(grupoId, filters),
    queryFn: () => PartidasService.list(grupoId, filters),
    select: (data) => data.partidas,
    enabled: !!grupoId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

export const usePartida = (partidaId: number) => {
  return useQuery({
    queryKey: partidasKeys.detail(partidaId),
    queryFn: () => PartidasService.getById(partidaId),
    select: (data) => data.partida,
    enabled: !!partidaId,
    staleTime: 2 * 60 * 1000,
  });
};

export const usePartidaDetalhes = (partidaId: number) => {
  return useQuery({
    queryKey: [...partidasKeys.detail(partidaId), "detalhes"],
    queryFn: () => PartidasService.getDetalhes(partidaId),
    select: (data) => data.partida,
    enabled: !!partidaId,
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
};

export const useConfirmacoesPartida = (partidaId: number) => {
  return useQuery({
    queryKey: partidasKeys.confirmacoesList(partidaId),
    queryFn: () => PartidasService.getConfirmacoes(partidaId),
    enabled: !!partidaId,
    staleTime: 1 * 60 * 1000,
  });
};

// Mutations
export const useCreatePartida = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      grupoId,
      data,
    }: {
      grupoId: number;
      data: CreatePartidaRequest;
    }) => PartidasService.create(grupoId, data),
    onSuccess: (_, { grupoId }) => {
      // Invalidar lista de partidas do grupo
      queryClient.invalidateQueries({ queryKey: partidasKeys.list(grupoId) });
    },
  });
};

export const useUpdatePartida = () => {
  const queryClient = useQueryClient();
  const invalidationUtils = createInvalidationUtils(queryClient);

  return useMutation({
    mutationFn: ({
      partidaId,
      data,
    }: {
      partidaId: number;
      data: UpdatePartidaRequest;
    }) => PartidasService.update(partidaId, data),
    onSuccess: (_, { partidaId }) => {
      // Usar função utilitária para invalidar partida
      invalidationUtils.invalidatePartida(partidaId);
    },
  });
};

export const useConfirmarPresenca = () => {
  const queryClient = useQueryClient();
  const invalidationUtils = createInvalidationUtils(queryClient);

  return useMutation({
    mutationFn: ({
      partidaId,
      status_presenca,
    }: {
      partidaId: number;
      status_presenca: "confirmado" | "nao_confirmado";
    }) => PartidasService.confirmarPresenca(partidaId, status_presenca),
    onSuccess: (_, { partidaId }) => {
      // Usar função utilitária para invalidar confirmações
      invalidationUtils.invalidateConfirmacoes(partidaId);
    },
  });
};

export const useIniciarPelada = () => {
  const queryClient = useQueryClient();
  const invalidationUtils = createInvalidationUtils(queryClient);

  return useMutation({
    mutationFn: (partidaId: number) => PartidasService.iniciarPelada(partidaId),
    onSuccess: (_, partidaId) => {
      // Usar função utilitária para invalidar partida
      invalidationUtils.invalidatePartida(partidaId);
    },
  });
};

export const useFinalizarPelada = () => {
  const queryClient = useQueryClient();
  const invalidationUtils = createInvalidationUtils(queryClient);

  return useMutation({
    mutationFn: (partidaId: number) =>
      PartidasService.finalizarPelada(partidaId),
    onSuccess: (_, partidaId) => {
      // Usar função utilitária para invalidar partida e ranking
      invalidationUtils.invalidatePartida(partidaId);
      invalidationUtils.invalidateRanking();
    },
  });
};
