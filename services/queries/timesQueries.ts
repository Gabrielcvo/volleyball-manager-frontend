import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import TimesService, {
  EditarTimeRequest,
  SortearTimesRequest,
} from "../api/times";
import { createInvalidationUtils } from "./invalidationUtils";

// Query Keys
export const timesKeys = {
  all: ["times"] as const,
  lists: () => [...timesKeys.all, "list"] as const,
  list: (partidaId: number) => [...timesKeys.lists(), partidaId] as const,
  details: () => [...timesKeys.all, "detail"] as const,
  detail: (id: number) => [...timesKeys.details(), id] as const,
};

// Queries
export const useTimesPartida = (partidaId: number) => {
  return useQuery({
    queryKey: timesKeys.list(partidaId),
    queryFn: () => TimesService.listar(partidaId),
    enabled: !!partidaId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// Mutations
export const useSortearTimes = () => {
  const queryClient = useQueryClient();
  const invalidationUtils = createInvalidationUtils(queryClient);

  return useMutation({
    mutationFn: ({
      partidaId,
      data,
    }: {
      partidaId: number;
      data: SortearTimesRequest;
    }) => TimesService.sortear(partidaId, data),
    onSuccess: (_, { partidaId }) => {
      // Usar função utilitária para invalidar times
      invalidationUtils.invalidateTimes(partidaId);
    },
  });
};

export const useEditarTime = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      timeId,
      data,
    }: {
      timeId: number;
      data: EditarTimeRequest;
    }) => TimesService.editar(timeId, data),
    onSuccess: (_, { timeId }) => {
      // Invalidar time específico
      queryClient.invalidateQueries({ queryKey: timesKeys.detail(timeId) });
      // Invalidar listas de times
      queryClient.invalidateQueries({ queryKey: timesKeys.lists() });
    },
  });
};

export const useAtualizarPontuacao = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      timeId,
      pontuacao,
    }: {
      timeId: number;
      pontuacao: number;
    }) => TimesService.atualizarPontuacao(timeId, pontuacao),
    onSuccess: (_, { timeId }) => {
      // Invalidar time específico
      queryClient.invalidateQueries({ queryKey: timesKeys.detail(timeId) });
      // Invalidar listas de times
      queryClient.invalidateQueries({ queryKey: timesKeys.lists() });
    },
  });
};
