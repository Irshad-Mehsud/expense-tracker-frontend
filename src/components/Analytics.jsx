import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { useExpense } from "../contexts/ExpenseContext";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { formatCurrency } from "@/lib/utils";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);


export default function Analytics() {
  const { getExpensesByCategory, getIncomesByCategory, getMonthlyTrend } = useExpense();

  // Data
  const expensesByCategory = getExpensesByCategory();
  const incomesByCategory = getIncomesByCategory();
  const monthlyTrend = getMonthlyTrend();

  // Debug: Log analytics data
  React.useEffect(() => {
    console.log("[UI] Analytics expensesByCategory:", expensesByCategory);
    console.log("[UI] Analytics incomesByCategory:", incomesByCategory);
    console.log("[UI] Analytics monthlyTrend:", monthlyTrend);
  }, [expensesByCategory, incomesByCategory, monthlyTrend]);

  // Chart Data
  const expensePieData = {
    labels: Object.keys(expensesByCategory),
    datasets: [
      {
        data: Object.values(expensesByCategory),
        backgroundColor: [
          "#f87171", "#fbbf24", "#34d399", "#60a5fa", "#a78bfa", "#f472b6", "#facc15", "#4ade80", "#38bdf8", "#c084fc", "#fb7185", "#fcd34d"
        ],
      },
    ],
  };

  const incomePieData = {
    labels: Object.keys(incomesByCategory),
    datasets: [
      {
        data: Object.values(incomesByCategory),
        backgroundColor: [
          "#34d399", "#60a5fa", "#a78bfa", "#f472b6", "#facc15", "#4ade80", "#38bdf8"
        ],
      },
    ],
  };

  const barData = {
    labels: monthlyTrend.map((m) => m.month),
    datasets: [
      {
        label: "Income",
        data: monthlyTrend.map((m) => m.income),
        backgroundColor: "#34d399",
      },
      {
        label: "Expenses",
        data: monthlyTrend.map((m) => m.expenses), // property is 'expenses' in context
        backgroundColor: "#f87171",
      },
    ],
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <Pie data={expensePieData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Income by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <Pie data={incomePieData} />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <Bar data={barData} />
        </CardContent>
      </Card>
    </div>
  );
}
