import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Tempo de cache padrão: 5 minutos
            staleTime: 5 * 60 * 1000,
            // Tempo de garbage collection: 10 minutos
            gcTime: 10 * 60 * 1000,
            // Retry automático em caso de erro
            retry: (failureCount, error: any) => {
              // Não retry para erros 4xx (exceto 408, 429)
              if (
                error?.response?.status >= 400 &&
                error?.response?.status < 500
              ) {
                if (
                  error?.response?.status === 408 ||
                  error?.response?.status === 429
                ) {
                  return failureCount < 2;
                }
                return false;
              }
              // Retry até 3 vezes para outros erros
              return failureCount < 3;
            },
            // Refetch quando a janela ganha foco
            refetchOnWindowFocus: false,
            // Refetch quando reconecta à internet
            refetchOnReconnect: true,
          },
          mutations: {
            // Retry para mutations apenas em caso de erro de rede
            retry: (failureCount, error: any) => {
              if (
                error?.code === "ERR_NETWORK" ||
                error?.code === "ECONNABORTED"
              ) {
                return failureCount < 2;
              }
              return false;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools temporariamente desabilitado para debug */}
      {/* {__DEV__ && <ReactQueryDevtools initialIsOpen={false} />} */}
    </QueryClientProvider>
  );
}
