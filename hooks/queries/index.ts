// Exportações centralizadas dos hooks do React Query

// Auth hooks
export * from "./useAuth";

// Grupos hooks
export * from "./useGrupos";

// Partidas hooks
export * from "./usePartidas";

// Jogos hooks
export * from "./useJogos";

// Times hooks
export * from "./useTimes";

// Ranking hooks
export * from "./useRanking";

// Utilities hooks
export * from "./useInvalidations";

// Re-exportar utilitários do QueryClient
export {
  invalidateQueries,
  queryClient,
  queryKeys,
} from "../../services/config/queryClient";
