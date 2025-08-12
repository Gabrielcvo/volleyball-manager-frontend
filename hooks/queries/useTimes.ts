import { useMutation, useQuery } from "@tanstack/react-query";
import TimesService, {
  EditarTimeRequest,
  SortearTimesRequest,
  SortearTimesResponse,
  Time,
  TimesPartida,
} from "../../services/api/times";
import {
  invalidateQueries,
  queryKeys,
} from "../../services/config/queryClient";

// Hook para listar times de uma partida
export const useTimes = (partidaId: number | null) => {
  const key = partidaId
    ? queryKeys.partidaTimes(partidaId)
    : ["partidas", "times", "disabled"];
  return useQuery({
    queryKey: key,
    queryFn: async (): Promise<TimesPartida> => {
      return await TimesService.listar(partidaId!);
    },
    enabled: !!partidaId,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

// Hook para sortear times
export const useSortearTimes = () => {
  return useMutation({
    mutationFn: async ({
      partidaId,
      data,
    }: {
      partidaId: number;
      data: SortearTimesRequest;
    }): Promise<SortearTimesResponse> => {
      return await TimesService.sortear(partidaId, data);
    },
    onSuccess: (data, variables) => {
      // Invalida os times da partida
      invalidateQueries.partida(variables.partidaId);

      // Invalida os jogos da partida (se existirem)
      invalidateQueries.jogosPartida(variables.partidaId);
    },
  });
};

// Hook para editar time
export const useEditarTime = () => {
  return useMutation({
    mutationFn: async ({
      timeId,
      data,
    }: {
      timeId: number;
      data: EditarTimeRequest;
    }): Promise<{ message: string; time: Time }> => {
      return await TimesService.editar(timeId, data);
    },
    onSuccess: (data, variables) => {
      // Invalida o time específico
      invalidateQueries.time(variables.timeId);

      // Como não temos o partidaId diretamente, invalidamos todas as partidas
      // Idealmente, poderíamos manter essa relação no cache
      invalidateQueries.partidas();
    },
  });
};

// Hook para atualizar pontuação de time
export const useAtualizarPontuacaoTime = () => {
  return useMutation({
    mutationFn: async ({
      timeId,
      pontuacao,
    }: {
      timeId: number;
      pontuacao: number;
    }): Promise<{ message: string; time: Time }> => {
      return await TimesService.atualizarPontuacao(timeId, pontuacao);
    },
    onSuccess: (data, variables) => {
      // Invalida o time específico
      invalidateQueries.time(variables.timeId);

      // Invalida todas as partidas para atualizar placares
      invalidateQueries.partidas();
    },
  });
};
