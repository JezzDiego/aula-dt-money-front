import { ITotal, ITransaction } from "@/types/transaction";
import { formatCurrency, formatDate } from "@/utils";

export interface ITableProps {
  data: ITransaction[];
  onEdit?: (transaction: ITransaction) => void;
  onDelete?: (id: string) => void;
}

export function Table({ data, onEdit, onDelete }: ITableProps) {
  return (
    <>
      <table className="w-full mt-16 border-0 border-separate border-spacing-y-2 pb-6">
        <thead>
          <tr>
            <th className="px-4 text-left text-table-header text-base font-medium">
              Título
            </th>
            <th className="px-4 text-left text-table-header text-base font-medium">
              Preço
            </th>
            <th className="px-4 text-left text-table-header text-base font-medium">
              Categoria
            </th>
            <th className="px-4 text-left text-table-header text-base font-medium">
              Data
            </th>
            <th className="px-4 text-left text-table-header text-base font-medium">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((transaction, index) => (
            <tr key={index} className="bg-white h-16 rounded-lg">
              <td className="px-4 py-4 whitespace-nowrap text-title">
                {transaction.title}
              </td>
              <td
                className={`px-4 py-4 whitespace-nowrap text-right ${
                  transaction.type === "INCOME" ? "text-income" : "text-outcome"
                }`}
              >
                {formatCurrency(transaction.price)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-table">
                {transaction.category}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-table">
                {transaction.data ? formatDate(new Date(transaction.data)) : ""}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-table">
                <div className="flex gap-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(transaction)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                      title="Editar transação"
                    >
                      Editar
                    </button>
                  )}
                  {onDelete && transaction.id && (
                    <button
                      onClick={() => onDelete(transaction.id!)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                      title="Excluir transação"
                    >
                      Excluir
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
