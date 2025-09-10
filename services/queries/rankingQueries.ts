import { useQuery, useQueryClient } from "@tanstack/react-query";
import RankingService from "../api/ranking";

// Query Keys
export const rankingKeys = {
  all: ["ranking"] as const,
  grupo: (grupoId: number) => [...rankingKeys.all, "grupo", grupoId] as const,
  historico: (grupoId: number, filters?: Record<string, any>) =>
    [...rankingKeys.all, "historico", grupoId, filters] as const,
  jogador: (grupoId: number, jogadorId: number) =>
    [...rankingKeys.all, "jogador", grupoId, jogadorId] as const,
  global: () => [...rankingKeys.all, "global"] as const,
};

// Queries
export const useRankingGrupo = (grupoId: number) => {
  return useQuery({
    queryKey: rankingKeys.grupo(grupoId),
    queryFn: () => RankingService.getRanking(grupoId),
    enabled: !!grupoId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useHistoricoPartidas = (
  grupoId: number,
  params?: { limit?: number; offset?: number }
) => {
  return useQuery({
    queryKey: rankingKeys.historico(grupoId, params),
    queryFn: () => RankingService.getHistorico(grupoId, params),
    enabled: !!grupoId,
    staleTime: 3 * 60 * 1000, // 3 minutos
  });
};

export const useEstatisticasJogador = (grupoId: number, jogadorId: number) => {
  return useQuery({
    queryKey: rankingKeys.jogador(grupoId, jogadorId),
    queryFn: () => RankingService.getEstatisticasJogador(grupoId, jogadorId),
    enabled: !!grupoId && !!jogadorId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useEstatisticasGlobais = () => {
  return useQuery({
    queryKey: rankingKeys.global(),
    queryFn: () => RankingService.getEstatisticasGerais(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Função utilitária para invalidar ranking após mudanças
export const useInvalidateRanking = () => {
  const queryClient = useQueryClient();

  return {
    invalidateGrupo: (grupoId: number) => {
      queryClient.invalidateQueries({ queryKey: rankingKeys.grupo(grupoId) });
      queryClient.invalidateQueries({
        queryKey: rankingKeys.historico(grupoId),
      });
    },
    invalidateGlobal: () => {
      queryClient.invalidateQueries({ queryKey: rankingKeys.global() });
    },
    invalidateJogador: (grupoId: number, jogadorId: number) => {
      queryClient.invalidateQueries({
        queryKey: rankingKeys.jogador(grupoId, jogadorId),
      });
      queryClient.invalidateQueries({ queryKey: rankingKeys.grupo(grupoId) });
    },
  };
};
