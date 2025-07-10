import { Card } from "../Card";

export interface ICardContainerProps {
  totals: {
    totalIncome: number;
    totalOutcome: number;
    totalTransactions: number;
  };
}

export function CardContainer({ totals }: ICardContainerProps) {
  const { totalIncome, totalOutcome, totalTransactions } = totals;

  return (
    <div className="flex justify-between">
      <Card title="Entradas" value={totalIncome} type="income" />
      <Card title="Saídas" value={totalOutcome} type="outcome" />
      <Card title="Total" value={totalIncome - totalOutcome} type="total" />
    </div>
  );
}
