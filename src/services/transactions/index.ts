import { ITransaction } from "@/types/transaction";
import { api } from "../api";
import { toast } from "react-toastify";
export async function getTransactions(skip?: number, take?: number) {
  try {
    const response = await api.get("/transaction", {
      params: {
        skip: skip || 0,
        take: take || 10,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("Erro ao buscar transações: " + error);
  }
}

export async function getAggregatedTransactions() {
  try {
    const response = await api.get("/transaction/aggregated");
    return response.data;
  } catch (error) {
    throw new Error("Erro ao buscar transações agregadas: " + error);
  }
}

export async function createTransaction(transaction: ITransaction) {
  try {
    const response = await api.post("/transaction", transaction);
    toast.success("Transação adicionada com sucesso!");
    return response.data;
  } catch (error) {
    throw new Error("Erro ao criar transação: " + error);
  }
}

export async function deleteTransaction(id: string) {
  try {
    await api.delete(`/transaction/${id}`);
    toast.success("Transação excluída com sucesso!");
  } catch (error) {
    throw new Error("Erro ao excluir transação: " + error);
  }
}

export async function updateTransaction(
  id: string,
  transaction: Partial<ITransaction>
) {
  try {
    const response = await api.patch(`/transaction/${id}`, transaction);
    toast.success("Transação atualizada com sucesso!");
    return response.data;
  } catch (error) {
    throw new Error("Erro ao atualizar transação: " + error);
  }
}
