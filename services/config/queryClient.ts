import { QueryClient } from "@tanstack/react-query";

// Configuração do cliente do React Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos - dados são considerados frescos por 5 minutos

      retry: 2, // Tentar novamente 2 vezes em caso de erro
      refetchOnWindowFocus: false, // Não recarregar ao focar na janela
      refetchOnMount: true, // Recarregar ao montar o componente
      refetchOnReconnect: true, // Recarregar quando reconectar à internet
    },
    mutations: {
      retry: 1, // Tentar novamente 1 vez para mutations
    },
  },
});

// Chaves para as queries - organizadas por entidade
export const queryKeys = {
  // Auth
  profile: ["auth", "profile"] as const,

  // Grupos
  grupos: ["grupos"] as const,
  grupo: (id: number) => ["grupos", id] as const,
  grupoMembros: (id: number) => ["grupos", id, "membros"] as const,

  // Partidas
  partidas: ["partidas"] as const,
  partida: (id: number) => ["partidas", id] as const,
  partidaTimes: (id: number) => ["partidas", id, "times"] as const,

  // Jogos
  jogosPartida: (partidaId: number) =>
    ["partidas", partidaId, "jogos"] as const,
  jogo: (id: number) => ["jogos", id] as const,

  // Times
  times: (grupoId: number) => ["grupos", grupoId, "times"] as const,
  time: (id: number) => ["times", id] as const,

  // Ranking
  ranking: (grupoId: number) => ["grupos", grupoId, "ranking"] as const,
} as const;

// Função para invalidar queries relacionadas
export const invalidateQueries = {
  // Invalidar tudo relacionado a grupos
  grupos: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.grupos });
  },

  // Invalidar grupo específico e suas relações
  grupo: (id: number) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.grupo(id) });
    queryClient.invalidateQueries({ queryKey: queryKeys.grupoMembros(id) });
    queryClient.invalidateQueries({ queryKey: queryKeys.times(id) });
    queryClient.invalidateQueries({ queryKey: queryKeys.ranking(id) });
  },

  // Invalidar tudo relacionado a partidas
  partidas: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.partidas });
  },

  // Invalidar partida específica e suas relações
  partida: (id: number) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.partida(id) });
    queryClient.invalidateQueries({ queryKey: queryKeys.partidaTimes(id) });
    queryClient.invalidateQueries({ queryKey: queryKeys.jogosPartida(id) });
  },

  // Invalidar jogos de uma partida
  jogosPartida: (partidaId: number) => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.jogosPartida(partidaId),
    });
    // Também invalida a partida para atualizar status geral
    queryClient.invalidateQueries({ queryKey: queryKeys.partida(partidaId) });
  },

  // Invalidar jogo específico
  jogo: (id: number) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.jogo(id) });
  },

  // Invalidar perfil do usuário
  profile: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.profile });
  },

  // Invalidar time específico
  time: (id: number) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.time(id) });
  },
};
