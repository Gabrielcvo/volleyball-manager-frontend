import {
  useAtualizarPontos,
  useCriarJogo,
  useFinalizarJogo,
  useIniciarJogo,
  useJogo,
  useJogosPartida,
} from "@/services/queries";
import {
  useFinalizarPelada,
  useIniciarPelada,
} from "@/services/queries/partidasQueries";

/**
 * Hook personalizado para gerenciar jogos
 * Demonstra como usar as queries do React Query para jogos
 */
export const useJogosManager = (partidaId: number) => {
  // Queries
  const {
    data: jogosData,
    isLoading: isLoadingJogos,
    error: errorJogos,
    refetch: refetchJogos,
  } = useJogosPartida(partidaId);

  // Mutations
  const iniciarJogoMutation = useIniciarJogo();
  const atualizarPontosMutation = useAtualizarPontos();
  const finalizarJogoMutation = useFinalizarJogo();
  const criarJogoMutation = useCriarJogo();
  const iniciarPeladaMutation = useIniciarPelada();
  const finalizarPeladaMutation = useFinalizarPelada();

  // Funções de conveniência
  const iniciarJogo = async (jogoId: number) => {
    try {
      const result = await iniciarJogoMutation.mutateAsync(jogoId);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const atualizarPontos = async (
    jogoId: number,
    placarTimeA: number,
    placarTimeB: number
  ) => {
    try {
      const result = await atualizarPontosMutation.mutateAsync({
        jogoId,
        data: { placar_time_a: placarTimeA, placar_time_b: placarTimeB },
      });
      return result;
    } catch (error) {
      throw error;
    }
  };

  const finalizarJogo = async (
    jogoId: number,
    placarTimeA: number,
    placarTimeB: number,
    observacoes?: string
  ) => {
    try {
      const result = await finalizarJogoMutation.mutateAsync({
        jogoId,
        data: {
          placar_time_a: placarTimeA,
          placar_time_b: placarTimeB,
          observacoes,
        },
      });
      return result;
    } catch (error) {
      throw error;
    }
  };

  const criarJogo = async (
    timeAId: number,
    timeBId: number,
    observacoes?: string
  ) => {
    try {
      const result = await criarJogoMutation.mutateAsync({
        partidaId,
        data: { time_a_id: timeAId, time_b_id: timeBId, observacoes },
      });
      return result;
    } catch (error) {
      throw error;
    }
  };

  const iniciarPelada = async () => {
    try {
      const result = await iniciarPeladaMutation.mutateAsync(partidaId);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const finalizarPelada = async () => {
    try {
      const result = await finalizarPeladaMutation.mutateAsync(partidaId);
      return result;
    } catch (error) {
      throw error;
    }
  };

  return {
    // Dados
    jogosData,
    jogos: jogosData?.jogos,
    partida: jogosData?.partida,
    times: jogosData?.times,
    serieInfo: jogosData?.serie_info,
    statusGeral: jogosData?.status_geral,
    proximoJogo: jogosData?.proximo_jogo,

    // Estados de loading
    isLoadingJogos,
    isIniciandoJogo: iniciarJogoMutation.isPending,
    isAtualizandoPontos: atualizarPontosMutation.isPending,
    isFinalizandoJogo: finalizarJogoMutation.isPending,
    isCriandoJogo: criarJogoMutation.isPending,
    isIniciandoPelada: iniciarPeladaMutation.isPending,
    isFinalizandoPelada: finalizarPeladaMutation.isPending,

    // Estados de erro
    errorJogos,
    errorIniciarJogo: iniciarJogoMutation.error,
    errorAtualizarPontos: atualizarPontosMutation.error,
    errorFinalizarJogo: finalizarJogoMutation.error,
    errorCriarJogo: criarJogoMutation.error,
    errorIniciarPelada: iniciarPeladaMutation.error,
    errorFinalizarPelada: finalizarPeladaMutation.error,

    // Funções
    iniciarJogo,
    atualizarPontos,
    finalizarJogo,
    criarJogo,
    iniciarPelada,
    finalizarPelada,
    refetchJogos,
  };
};

/**
 * Hook para gerenciar um jogo específico
 */
export const useJogoManager = (jogoId: number) => {
  // Queries
  const {
    data: jogoData,
    isLoading: isLoadingJogo,
    error: errorJogo,
    refetch: refetchJogo,
  } = useJogo(jogoId);

  return {
    // Dados
    jogo: jogoData?.jogo,
    estatisticasContexto: jogoData?.estatisticas_contexto,

    // Estados
    isLoadingJogo,
    errorJogo,

    // Funções
    refetchJogo,
  };
};
