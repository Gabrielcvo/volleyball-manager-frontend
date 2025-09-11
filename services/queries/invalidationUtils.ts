import { QueryClient } from "@tanstack/react-query";

// Funções utilitárias para invalidação de queries relacionadas
export const createInvalidationUtils = (queryClient: QueryClient) => {
  return {
    // Invalidar todas as queries relacionadas a um grupo
    invalidateGrupo: (grupoId: number) => {
      // Invalidar grupos
      queryClient.invalidateQueries({ queryKey: ["grupos"] });
      queryClient.invalidateQueries({
        queryKey: ["grupos", "detail", grupoId],
      });
      queryClient.invalidateQueries({
        queryKey: ["grupos", "membros", grupoId],
      });

      // Invalidar partidas do grupo
      queryClient.invalidateQueries({
        queryKey: ["partidas", "list", grupoId],
      });

      // Invalidar ranking do grupo
      queryClient.invalidateQueries({
        queryKey: ["ranking", "grupo", grupoId],
      });
      queryClient.invalidateQueries({
        queryKey: ["ranking", "historico", grupoId],
      });
    },

    // Invalidar todas as queries relacionadas a uma partida
    invalidatePartida: (partidaId: number, grupoId?: number) => {
      // Invalidar partida específica
      queryClient.invalidateQueries({
        queryKey: ["partidas", "detail", partidaId],
      });
      queryClient.invalidateQueries({
        queryKey: ["partidas", "confirmacoes", partidaId],
      });

      // Invalidar jogos da partida
      queryClient.invalidateQueries({ queryKey: ["jogos", "list", partidaId] });

      // Invalidar times da partida
      queryClient.invalidateQueries({ queryKey: ["times", "list", partidaId] });

      // Invalidar listas de partidas
      queryClient.invalidateQueries({ queryKey: ["partidas", "list"] });

      // Se grupoId fornecido, invalidar ranking do grupo
      if (grupoId) {
        queryClient.invalidateQueries({
          queryKey: ["ranking", "grupo", grupoId],
        });
        queryClient.invalidateQueries({
          queryKey: ["ranking", "historico", grupoId],
        });
      }
    },

    // Invalidar todas as queries relacionadas a um jogo
    invalidateJogo: (jogoId: number, partidaId?: number) => {
      // Invalidar jogo específico
      queryClient.invalidateQueries({ queryKey: ["jogos", "detail", jogoId] });

      // Se partidaId fornecido, invalidar jogos da partida
      if (partidaId) {
        queryClient.invalidateQueries({
          queryKey: ["jogos", "list", partidaId],
        });
        queryClient.invalidateQueries({
          queryKey: ["partidas", "detail", partidaId],
        });
      }
    },

    // Invalidar todas as queries relacionadas a times
    invalidateTimes: (partidaId: number) => {
      queryClient.invalidateQueries({ queryKey: ["times", "list", partidaId] });
      queryClient.invalidateQueries({
        queryKey: ["partidas", "detail", partidaId],
      });
    },

    // Invalidar ranking após mudanças que afetam estatísticas
    invalidateRanking: (grupoId?: number) => {
      if (grupoId) {
        queryClient.invalidateQueries({
          queryKey: ["ranking", "grupo", grupoId],
        });
        queryClient.invalidateQueries({
          queryKey: ["ranking", "historico", grupoId],
        });
        queryClient.invalidateQueries({
          queryKey: ["ranking", "jogador", grupoId],
        });
      }
      // Sempre invalidar ranking global
      queryClient.invalidateQueries({ queryKey: ["ranking", "global"] });
    },

    // Invalidar confirmações de presença
    invalidateConfirmacoes: (partidaId: number) => {
      queryClient.invalidateQueries({
        queryKey: ["partidas", "confirmacoes", partidaId],
      });
      queryClient.invalidateQueries({
        queryKey: ["partidas", "detail", partidaId],
      });
      queryClient.invalidateQueries({ queryKey: ["partidas", "list"] });
    },

    // Invalidar membros de grupo
    invalidateMembros: (grupoId: number) => {
      queryClient.invalidateQueries({
        queryKey: ["grupos", "membros", grupoId],
      });
      queryClient.invalidateQueries({
        queryKey: ["grupos", "detail", grupoId],
      });
    },
  };
};
