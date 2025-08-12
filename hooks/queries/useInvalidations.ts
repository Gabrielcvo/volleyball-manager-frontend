import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../services/config/queryClient";

/**
 * Hook para invalidações inteligentes do cache
 * Centraliza a lógica de invalidação para evitar inconsistências
 */
export const useInvalidations = () => {
  const queryClient = useQueryClient();

  return {
    // Invalidar tudo relacionado a um grupo específico
    invalidateGrupo: (grupoId: number) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.grupo(grupoId) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.grupoMembros(grupoId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.times(grupoId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.ranking(grupoId) });
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.partidas, grupoId],
      });
    },

    // Invalidar tudo relacionado a uma partida específica
    invalidatePartida: (partidaId: number) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.partida(partidaId) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.partidaTimes(partidaId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.jogosPartida(partidaId),
      });

      // Invalida detalhes e confirmações da partida
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.partida(partidaId), "detalhes"],
      });
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.partida(partidaId), "confirmacoes"],
      });
    },

    // Invalidar quando um jogo é atualizado
    invalidateJogo: (jogoId: number, partidaId?: number) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jogo(jogoId) });

      if (partidaId) {
        // Invalida os jogos da partida e a própria partida
        queryClient.invalidateQueries({
          queryKey: queryKeys.jogosPartida(partidaId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.partida(partidaId),
        });
      }
    },

    // Invalidar quando times são atualizados
    invalidateTimes: (partidaId: number) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.partidaTimes(partidaId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.partida(partidaId) });

      // Se há jogos, também invalida
      queryClient.invalidateQueries({
        queryKey: queryKeys.jogosPartida(partidaId),
      });
    },

    // Invalidar todas as listas (útil após mudanças importantes)
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.grupos });
      queryClient.invalidateQueries({ queryKey: queryKeys.partidas });
    },

    // Limpar dados específicos (útil para logout)
    clearUserData: () => {
      queryClient.removeQueries({ queryKey: queryKeys.profile });
      queryClient.removeQueries({ queryKey: queryKeys.grupos });
      queryClient.removeQueries({ queryKey: queryKeys.partidas });
    },

    // Pré-carregar dados relacionados
    prefetchGrupoData: async (grupoId: number) => {
      // Pré-carrega membros e ranking quando carrega um grupo
      await Promise.all([
        queryClient.prefetchQuery({
          queryKey: queryKeys.grupoMembros(grupoId),
          queryFn: () =>
            import("../../services/api/grupos").then((s) =>
              s.default.getMembros(grupoId)
            ),
        }),
        queryClient.prefetchQuery({
          queryKey: queryKeys.ranking(grupoId),
          queryFn: () =>
            import("../../services/api/ranking").then((s) =>
              s.default.getRanking(grupoId)
            ),
        }),
      ]);
    },

    // Invalidar dados relacionados ao ranking
    invalidateRanking: (grupoId: number) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ranking(grupoId) });
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.ranking(grupoId), "historico"],
      });
    },
  };
};

