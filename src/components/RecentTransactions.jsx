import { useExpense } from "../contexts/ExpenseContext";
import { useNotification } from "../context/NotificationContext";
import { Button } from "./ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TrendingUp, TrendingDown, Trash2 } from "lucide-react";

export default function RecentTransactions({ limit = 10 }) {
  const { getRecentTransactions, deleteIncome, deleteExpense } = useExpense();
  const { showNotification } = useNotification();

  const transactions = getRecentTransactions(limit);

  const handleDelete = async (transaction) => {
    const result =
      transaction.type === "income"
        ? await deleteIncome(transaction._id)
        : await deleteExpense(transaction._id);

    if (result.success) {
      showNotification("success", `${transaction.type === "income" ? "Income" : "Expense"} deleted`);
    } else {
      showNotification("error", result.error);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No transactions yet</p>
        <p className="text-sm mt-1">Add some income or expenses to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div
          key={`${transaction.type}-${transaction._id}`}
          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                transaction.type === "income"
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {transaction.type === "income" ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
            </div>
            <div>
              <p className="font-medium">{transaction.title}</p>
              <p className="text-xs text-muted-foreground">
                {transaction.category} • {formatDate(transaction.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`font-semibold ${
                transaction.type === "income"
                  ? "text-success"
                  : "text-destructive"
              }`}
            >
              {transaction.type === "income" ? "+" : "-"}
              {formatCurrency(transaction.amount)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => handleDelete(transaction)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
