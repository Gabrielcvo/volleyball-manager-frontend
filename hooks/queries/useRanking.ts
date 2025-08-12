import { useQuery } from "@tanstack/react-query";
import RankingService, {
  EstatisticasGlobais,
  EstatisticasJogador,
  HistoricoPartidas,
  RankingGrupo,
} from "../../services/api/ranking";
import { queryKeys } from "../../services/config/queryClient";

// Hook para buscar ranking de um grupo
export const useRanking = (grupoId: number | null) => {
  const key = grupoId ? queryKeys.ranking(grupoId) : ["ranking", "disabled"];
  return useQuery({
    queryKey: key,
    queryFn: async (): Promise<RankingGrupo> => {
      return await RankingService.getRanking(grupoId!);
    },
    enabled: !!grupoId,
    staleTime: 5 * 60 * 1000, // 5 minutos - ranking não muda muito frequentemente
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

// Hook para buscar histórico de partidas de um grupo
export const useHistoricoPartidas = (
  grupoId: number | null,
  params?: { limit?: number; offset?: number }
) => {
  return useQuery({
    queryKey: [...queryKeys.ranking(grupoId!), "historico", params],
    queryFn: async (): Promise<HistoricoPartidas> => {
      return await RankingService.getHistorico(grupoId!, params);
    },
    enabled: !!grupoId,
    staleTime: 10 * 60 * 1000, // 10 minutos - histórico é raramente alterado
  });
};

// Hook para buscar estatísticas de um jogador específico
export const useEstatisticasJogador = (
  grupoId: number | null,
  jogadorId: number | null
) => {
  return useQuery({
    queryKey: [queryKeys.ranking(grupoId!), "jogador", jogadorId],
    queryFn: async (): Promise<EstatisticasJogador> => {
      return await RankingService.getEstatisticasJogador(grupoId!, jogadorId!);
    },
    enabled: !!grupoId && !!jogadorId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para buscar estatísticas gerais globais
export const useEstatisticasGerais = () => {
  return useQuery({
    queryKey: ["ranking", "global"],
    queryFn: async (): Promise<EstatisticasGlobais> => {
      return await RankingService.getEstatisticasGerais();
    },
    staleTime: 30 * 60 * 1000, // 30 minutos - estatísticas globais mudam lentamente
  });
};
