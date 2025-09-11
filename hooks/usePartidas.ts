import {
  useConfirmacoesPartida,
  useConfirmarPresenca,
  useCreatePartida,
  useFinalizarPelada,
  useIniciarPelada,
  usePartida,
  usePartidaDetalhes,
  usePartidas,
  useUpdatePartida,
} from "@/services/queries";

/**
 * Hook personalizado para gerenciar partidas
 * Demonstra como usar as queries do React Query para partidas
 */
export const usePartidasManager = (grupoId: number) => {
  // Queries
  const {
    data: partidas,
    isLoading: isLoadingPartidas,
    error: errorPartidas,
    refetch: refetchPartidas,
  } = usePartidas(grupoId);

  // Mutations
  const createPartidaMutation = useCreatePartida();
  const updatePartidaMutation = useUpdatePartida();
  const confirmarPresencaMutation = useConfirmarPresenca();
  const iniciarPeladaMutation = useIniciarPelada();
  const finalizarPeladaMutation = useFinalizarPelada();

  // Funções de conveniência
  const criarPartida = async (data: {
    data_hora: string;
    local?: string;
    duracao_estimada_minutos?: number;
    limite_jogadores?: number;
    valor_pelada?: number;
  }) => {
    try {
      const result = await createPartidaMutation.mutateAsync({ grupoId, data });
      return result;
    } catch (error) {
      throw error;
    }
  };

  const atualizarPartida = async (
    partidaId: number,
    data: {
      data_hora?: string;
      local?: string;
      duracao_estimada_minutos?: number;
      limite_jogadores?: number;
      valor_pelada?: number;
      status?: string;
    }
  ) => {
    try {
      const result = await updatePartidaMutation.mutateAsync({
        partidaId,
        data,
      });
      return result;
    } catch (error) {
      throw error;
    }
  };

  const confirmarPresenca = async (
    partidaId: number,
    status: "confirmado" | "nao_confirmado"
  ) => {
    try {
      const result = await confirmarPresencaMutation.mutateAsync({
        partidaId,
        status_presenca: status,
      });
      return result;
    } catch (error) {
      throw error;
    }
  };

  const iniciarPelada = async (partidaId: number) => {
    try {
      const result = await iniciarPeladaMutation.mutateAsync(partidaId);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const finalizarPelada = async (partidaId: number) => {
    try {
      const result = await finalizarPeladaMutation.mutateAsync(partidaId);
      return result;
    } catch (error) {
      throw error;
    }
  };

  return {
    // Dados
    partidas,

    // Estados de loading
    isLoadingPartidas,
    isCreatingPartida: createPartidaMutation.isPending,
    isUpdatingPartida: updatePartidaMutation.isPending,
    isConfirmingPresenca: confirmarPresencaMutation.isPending,
    isIniciandoPelada: iniciarPeladaMutation.isPending,
    isFinalizandoPelada: finalizarPeladaMutation.isPending,

    // Estados de erro
    errorPartidas,
    errorCreatePartida: createPartidaMutation.error,
    errorUpdatePartida: updatePartidaMutation.error,
    errorConfirmarPresenca: confirmarPresencaMutation.error,
    errorIniciarPelada: iniciarPeladaMutation.error,
    errorFinalizarPelada: finalizarPeladaMutation.error,

    // Funções
    criarPartida,
    atualizarPartida,
    confirmarPresenca,
    iniciarPelada,
    finalizarPelada,
    refetchPartidas,
  };
};

/**
 * Hook para gerenciar uma partida específica
 */
export const usePartidaManager = (partidaId: number) => {
  // Queries
  const {
    data: partida,
    isLoading: isLoadingPartida,
    error: errorPartida,
    refetch: refetchPartida,
  } = usePartida(partidaId);

  const {
    data: partidaDetalhes,
    isLoading: isLoadingDetalhes,
    error: errorDetalhes,
    refetch: refetchDetalhes,
  } = usePartidaDetalhes(partidaId);

  const {
    data: confirmacoes,
    isLoading: isLoadingConfirmacoes,
    error: errorConfirmacoes,
    refetch: refetchConfirmacoes,
  } = useConfirmacoesPartida(partidaId);

  return {
    // Dados
    partida,
    partidaDetalhes,
    confirmacoes,

    // Estados de loading
    isLoadingPartida,
    isLoadingDetalhes,
    isLoadingConfirmacoes,

    // Estados de erro
    errorPartida,
    errorDetalhes,
    errorConfirmacoes,

    // Funções
    refetchPartida,
    refetchDetalhes,
    refetchConfirmacoes,
  };
};
