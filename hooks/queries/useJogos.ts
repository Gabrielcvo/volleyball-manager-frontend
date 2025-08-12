import { useMutation, useQuery } from "@tanstack/react-query";
import JogosService, {
  AtualizarPontosRequest,
  AtualizarPontosResponse,
  FinalizarJogoRequest,
  FinalizarJogoResponse,
  InicializarJogosRequest,
  InicializarJogosResponse,
  JogosPartida,
  ObterJogoResponse,
} from "../../services/api/jogos";
import {
  invalidateQueries,
  queryKeys,
} from "../../services/config/queryClient";

// Hook para listar jogos de uma partida
export const useJogosPartida = (partidaId: number | null) => {
  return useQuery({
    queryKey: queryKeys.jogosPartida(partidaId!),
    queryFn: async (): Promise<JogosPartida> => {
      return await JogosService.listar(partidaId!);
    },
    enabled: !!partidaId,
    staleTime: 30 * 1000, // 30 segundos - jogos mudam frequentemente
  });
};

// Hook para buscar detalhes de um jogo específico
export const useJogo = (jogoId: number | null) => {
  return useQuery({
    queryKey: queryKeys.jogo(jogoId!),
    queryFn: async (): Promise<ObterJogoResponse> => {
      return await JogosService.obterJogo(jogoId!);
    },
    enabled: !!jogoId,
    staleTime: 30 * 1000, // 30 segundos - dados do jogo mudam durante a partida
  });
};

// Hook para inicializar sistema de jogos
export const useInicializarJogos = () => {
  return useMutation({
    mutationFn: async ({
      partidaId,
      data,
    }: {
      partidaId: number;
      data: InicializarJogosRequest;
    }): Promise<InicializarJogosResponse> => {
      return await JogosService.inicializar(partidaId, data);
    },
    onSuccess: (data, variables) => {
      // Invalida os jogos da partida
      invalidateQueries.jogosPartida(variables.partidaId);

      // Invalida a partida para atualizar status
      invalidateQueries.partida(variables.partidaId);
    },
  });
};

// Hook para iniciar um jogo
export const useIniciarJogo = () => {
  return useMutation({
    mutationFn: async (
      jogoId: number
    ): Promise<{ message: string; jogo: any; proximo_passo: string }> => {
      return await JogosService.iniciarJogo(jogoId);
    },
    onSuccess: (data, jogoId) => {
      // Invalida o jogo específico
      invalidateQueries.jogo(jogoId);

      // Busca o partidaId do jogo para invalidar os jogos da partida
      // Como não temos o partidaId diretamente, vamos invalidar todas as queries de jogos
      // Idealmente, poderíamos armazenar essa relação no cache
      queryKeys.jogosPartida; // Precisaríamos de uma forma de obter o partidaId
    },
  });
};

// Hook para atualizar pontos de um jogo
export const useAtualizarPontos = () => {
  return useMutation({
    mutationFn: async ({
      jogoId,
      data,
    }: {
      jogoId: number;
      data: AtualizarPontosRequest;
    }): Promise<AtualizarPontosResponse> => {
      return await JogosService.atualizarPontos(jogoId, data);
    },
    onSuccess: (data, variables) => {
      // Invalida o jogo específico
      invalidateQueries.jogo(variables.jogoId);

      // Se tivéssemos o partidaId, invalidaríamos também os jogos da partida
      // Por enquanto, vamos invalidar todas as queries relacionadas a jogos
    },
  });
};

// Hook para finalizar um jogo
export const useFinalizarJogo = () => {
  return useMutation({
    mutationFn: async ({
      jogoId,
      data,
    }: {
      jogoId: number;
      data: FinalizarJogoRequest;
    }): Promise<FinalizarJogoResponse> => {
      return await JogosService.finalizarJogo(jogoId, data);
    },
    onSuccess: (data, variables) => {
      // Invalida o jogo específico
      invalidateQueries.jogo(variables.jogoId);

      // Se houve um próximo jogo criado, poderíamos invalidar os jogos da partida
      if (data.proximo_jogo) {
        // Invalidar jogos da partida seria ideal aqui
      }
    },
  });
};

// Hook para criar próximo jogo manualmente
export const useCriarProximoJogo = () => {
  return useMutation({
    mutationFn: async ({
      partidaId,
      data,
    }: {
      partidaId: number;
      data: { time_a_id: number; time_b_id: number; observacoes?: string };
    }): Promise<{ message: string; jogo: any }> => {
      return await JogosService.criarProximoJogo(partidaId, data);
    },
    onSuccess: (data, variables) => {
      // Invalida os jogos da partida
      invalidateQueries.jogosPartida(variables.partidaId);

      // Invalida a partida para atualizar status
      invalidateQueries.partida(variables.partidaId);
    },
  });
};

