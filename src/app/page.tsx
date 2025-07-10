"use client";
import { BodyContainer } from "@/components/BodyContainer";
import { CardContainer } from "@/components/CardContainer";
import { FormModal } from "@/components/FormModal";
import { Header } from "@/components/Header";
import { Table } from "@/components/Table";
import { useTransaction } from "@/hooks/transactions";
import { ITransaction } from "@/types/transaction";
import { useState, useEffect, useCallback } from "react";
import { ToastContainer } from "react-toastify";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] =
    useState<ITransaction | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [skip, setSkip] = useState(0);
  const [take] = useState(10);
  const [allTransactions, setAllTransactions] = useState<ITransaction[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const {
    data: transactions,
    isLoading,
    refetch: refetchTransactions,
  } = useTransaction.ListAll(skip, take);
  const { data: aggregated } = useTransaction.GetAggregated();
  const { mutateAsync: addTransaction } = useTransaction.Create();
  const { mutateAsync: deleteTransaction } = useTransaction.Delete();
  const { mutateAsync: updateTransaction } = useTransaction.Update();

  // Adicionar novas transações ao array existente
  useEffect(() => {
    if (transactions && transactions.length > 0) {
      if (skip === 0) {
        // Primeira carga
        setAllTransactions(transactions);
      } else {
        // Carregamento adicional
        setAllTransactions((prev) => [...prev, ...transactions]);
      }

      // Verificar se ainda há mais dados para carregar
      setHasMore(transactions.length === take);
      setIsLoadingMore(false);
    } else if (skip > 0) {
      // Não há mais dados
      setHasMore(false);
      setIsLoadingMore(false);
    }
  }, [transactions, skip, take]);

  // Função para detectar quando o usuário chegou ao final das transações
  const handleScroll = useCallback(() => {
    // Encontrar a tabela de transações
    const table = document.querySelector("table");
    if (!table) return;

    const tableRect = table.getBoundingClientRect();
    const tableBottom = tableRect.bottom;
    const windowHeight = window.innerHeight;

    // Se a parte inferior da tabela está visível na tela
    if (
      tableBottom <= windowHeight && // 100px de margem
      !isLoading &&
      !isLoadingMore &&
      hasMore
    ) {
      setIsLoadingMore(true);
      setSkip((prev) => prev + take);
    }
  }, [isLoading, isLoadingMore, hasMore, take]);

  // Adicionar listener de scroll
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Detectar quando estamos carregando mais itens (skip > 0)
  useEffect(() => {
    if (skip > 0 && isLoading) {
      setIsLoadingMore(true);
    }
  }, [skip, isLoading]);

  const openModal = () => {
    setIsEditing(false);
    setTransactionToEdit(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setTransactionToEdit(null);
  };

  const handleAddModal = (newTransaction: ITransaction) => {
    addTransaction(newTransaction);
    // Resetar paginação quando uma nova transação é adicionada
    setSkip(0);
    setAllTransactions([]);
    setHasMore(true);
    refetchTransactions();
  };

  const handleEditTransaction = (transaction: ITransaction) => {
    setTransactionToEdit(transaction);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleUpdateTransaction = (
    id: string,
    updatedTransaction: ITransaction
  ) => {
    updateTransaction({ id, transaction: updatedTransaction });
  };

  const handleDeleteTransaction = (id: string) => {
    deleteTransaction(id);
    // Resetar paginação quando uma transação é excluída
    setSkip(0);
    setAllTransactions([]);
    setHasMore(true);
    refetchTransactions();
  };

  if (isLoading && skip === 0)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-income"></div>
      </div>
    );

  return (
    <div>
      <ToastContainer />
      <Header openModal={openModal} />
      <BodyContainer>
        <CardContainer totals={aggregated} />
        {aggregated && allTransactions && (
          <div className="mt-12 -mb-12 sticky top-10">
            <span className="bg-white shadow-lg border border-gray-300 rounded-lg p-2">
              {allTransactions.length}/{aggregated.totalTransactions} transações
            </span>
          </div>
        )}
        <Table
          data={allTransactions}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
        />
        {isLoadingMore && (
          <div className="flex justify-center pt-6 pb-12">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-income"></div>
              <span className="text-gray-600">
                Carregando mais transações...
              </span>
            </div>
          </div>
        )}
        {!hasMore && !isLoadingMore && allTransactions.length > 0 && (
          <div className="text-center py-6 text-gray-500">
            <p>Você chegou ao final da lista</p>
            <p className="text-sm mt-1">Não há mais transações para carregar</p>
          </div>
        )}
        {allTransactions.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">Nenhuma transação encontrada</p>
            <p className="text-sm">
              Adicione sua primeira transação clicando no botão acima
            </p>
          </div>
        )}
        {isModalOpen && (
          <FormModal
            closeModal={handleCloseModal}
            formTitle={isEditing ? "Editar Transação" : "Adicionar Transação"}
            addTransaction={handleAddModal}
            editTransaction={handleUpdateTransaction}
            transactionToEdit={transactionToEdit || undefined}
            isEditing={isEditing}
          />
        )}
      </BodyContainer>
    </div>
  );
}
