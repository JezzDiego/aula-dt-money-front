import { QueryClient } from "@tanstack/react-query";
import { queryCache, mutationCache } from "@/hooks/transactions";

export const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 10, // 10 minutos
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Retry apenas para erros de rede
        if (
          failureCount < 3 &&
          error instanceof Error &&
          error.message.includes("network")
        ) {
          return true;
        }
        return false;
      },
    },
    mutations: {
      retry: false, // Não retry mutations por padrão
    },
  },
});
