import {
  createTransaction,
  getTransactions,
  deleteTransaction,
  updateTransaction,
  getAggregatedTransactions,
} from "@/services/transactions";
import { ITransaction } from "@/types/transaction";
import {
  useMutation,
  useQuery,
  useQueryClient,
  QueryClient,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";

const QUERY_KEY = "qkTransaction";

// Tipo para os dados de transações
interface TransactionData {
  data: ITransaction[];
  total?: number;
  skip?: number;
  take?: number;
}

// Configuração do QueryCache para tratamento global de erros
export const queryCache = new QueryCache({
  onError: (error, query) => {
    console.error(`Erro na query ${query.queryKey}:`, error);
  },
});

// Configuração do MutationCache para tratamento global de erros
export const mutationCache = new MutationCache({
  onError: (error) => {
    console.error(`Erro na mutation:`, error);
  },
});

// Estratégias de cache otimista
const optimisticUpdate = (
  queryClient: QueryClient,
  id: string,
  updates: Partial<ITransaction>
) => {
  // Atualiza o cache otimisticamente
  queryClient.setQueryData(
    [QUERY_KEY],
    (oldData: TransactionData | undefined) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        data: oldData.data?.map((transaction: ITransaction) =>
          transaction.id === id ? { ...transaction, ...updates } : transaction
        ),
      };
    }
  );
};

const optimisticDelete = (queryClient: QueryClient, id: string) => {
  // Remove do cache otimisticamente
  queryClient.setQueryData(
    [QUERY_KEY],
    (oldData: TransactionData | undefined) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        data: oldData.data?.filter(
          (transaction: ITransaction) => transaction.id !== id
        ),
      };
    }
  );
};

const optimisticCreate = (
  queryClient: QueryClient,
  newTransaction: ITransaction
) => {
  // Adiciona ao cache otimisticamente
  queryClient.setQueryData(
    [QUERY_KEY],
    (oldData: TransactionData | undefined) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        data: [newTransaction, ...(oldData.data || [])],
      };
    }
  );
};

const Create = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTransaction,
    onMutate: async (newTransaction) => {
      // Cancela queries em andamento para evitar conflitos
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY] });

      // Snapshot do estado anterior
      const previousData = queryClient.getQueryData([QUERY_KEY]);

      // Aplica atualização otimista
      optimisticCreate(queryClient, newTransaction);

      // Retorna contexto para rollback
      return { previousData };
    },
    onError: (err, newTransaction, context) => {
      // Rollback em caso de erro
      if (context?.previousData) {
        queryClient.setQueryData([QUERY_KEY], context.previousData);
      }
    },
    onSettled: () => {
      // Sempre revalida após sucesso ou erro
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "aggregated"] });
    },
  });
};

const Delete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTransaction,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY] });

      const previousData = queryClient.getQueryData([QUERY_KEY]);

      optimisticDelete(queryClient, id);

      return { previousData };
    },
    onError: (err, id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData([QUERY_KEY], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "aggregated"] });
    },
  });
};

const Update = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      transaction,
    }: {
      id: string;
      transaction: Partial<ITransaction>;
    }) => updateTransaction(id, transaction),
    onMutate: async ({ id, transaction }) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY] });

      const previousData = queryClient.getQueryData([QUERY_KEY]);

      optimisticUpdate(queryClient, id, transaction);

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData([QUERY_KEY], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "aggregated"] });
    },
  });
};

const ListAll = (skip?: number, take?: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, skip, take],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return getTransactions(skip, take);
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos (anteriormente cacheTime)
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Retry apenas para erros de rede, não para erros 4xx
      if (
        failureCount < 3 &&
        error instanceof Error &&
        error.message.includes("network")
      ) {
        return true;
      }
      return false;
    },
  });
};

const GetAggregated = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "aggregated"],
    queryFn: () => getAggregatedTransactions(),
    staleTime: 1000 * 60 * 2, // 2 minutos para dados agregados
    gcTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
  });
};

// Função utilitária para limpar cache específico
export const clearTransactionCache = (queryClient: QueryClient) => {
  queryClient.removeQueries({ queryKey: [QUERY_KEY] });
};

// Função para pré-carregar dados
export const prefetchTransactions = async (
  queryClient: QueryClient,
  skip?: number,
  take?: number
) => {
  await queryClient.prefetchQuery({
    queryKey: [QUERY_KEY, skip, take],
    queryFn: () => getTransactions(skip, take),
    staleTime: 1000 * 60 * 5,
  });
};

export const useTransaction = {
  Create,
  Delete,
  Update,
  ListAll,
  GetAggregated,
};
