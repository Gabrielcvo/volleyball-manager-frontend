import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import JogosService, {
  AtualizarPontosRequest,
  FinalizarJogoRequest,
} from "../api/jogos";
import { createInvalidationUtils } from "./invalidationUtils";

// Query Keys
export const jogosKeys = {
  all: ["jogos"] as const,
  lists: () => [...jogosKeys.all, "list"] as const,
  list: (partidaId: number) => [...jogosKeys.lists(), partidaId] as const,
  details: () => [...jogosKeys.all, "detail"] as const,
  detail: (id: number) => [...jogosKeys.details(), id] as const,
};

// Queries
export const useJogosPartida = (partidaId: number) => {
  return useQuery({
    queryKey: jogosKeys.list(partidaId),
    queryFn: () => JogosService.listar(partidaId),
    enabled: !!partidaId,
    staleTime: 30 * 1000, // 30 segundos - dados de jogo mudam frequentemente
    refetchInterval: 10 * 1000, // Refetch a cada 10 segundos quando ativo
  });
};

export const useJogo = (jogoId: number) => {
  return useQuery({
    queryKey: jogosKeys.detail(jogoId),
    queryFn: () => JogosService.obterJogo(jogoId),
    enabled: !!jogoId,
    staleTime: 15 * 1000, // 15 segundos
  });
};

// Mutations

export const useIniciarJogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jogoId: number) => JogosService.iniciarJogo(jogoId),
    onSuccess: (_, jogoId) => {
      // Invalidar jogo específico
      queryClient.invalidateQueries({ queryKey: jogosKeys.detail(jogoId) });
      // Invalidar lista de jogos da partida
      queryClient.invalidateQueries({ queryKey: jogosKeys.lists() });
    },
  });
};

export const useAtualizarPontos = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      jogoId,
      data,
    }: {
      jogoId: number;
      data: AtualizarPontosRequest;
    }) => JogosService.atualizarPontos(jogoId, data),
    onSuccess: (_, { jogoId }) => {
      // Invalidar jogo específico
      queryClient.invalidateQueries({ queryKey: jogosKeys.detail(jogoId) });
      // Invalidar lista de jogos da partida
      queryClient.invalidateQueries({ queryKey: jogosKeys.lists() });
    },
  });
};

export const useFinalizarJogo = () => {
  const queryClient = useQueryClient();
  const invalidationUtils = createInvalidationUtils(queryClient);

  return useMutation({
    mutationFn: ({
      jogoId,
      data,
    }: {
      jogoId: number;
      data: FinalizarJogoRequest;
    }) => JogosService.finalizarJogo(jogoId, data),
    onSuccess: (_, { jogoId }) => {
      // Usar função utilitária para invalidar jogo e ranking
      invalidationUtils.invalidateJogo(jogoId);
      invalidationUtils.invalidateRanking();
    },
  });
};

export const useCriarJogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      partidaId,
      data,
    }: {
      partidaId: number;
      data: { time_a_id: number; time_b_id: number; observacoes?: string };
    }) => JogosService.criarJogo(partidaId, data),
    onSuccess: (_, { partidaId }) => {
      // Invalidar jogos da partida
      queryClient.invalidateQueries({ queryKey: jogosKeys.list(partidaId) });
    },
  });
};
