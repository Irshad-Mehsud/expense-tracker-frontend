import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { useExpense } from "../contexts/ExpenseContext";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const categoryColors = {
  "Food & Dining": "#f97316",
  "Transportation": "#3b82f6",
  "Shopping": "#ec4899",
  "Entertainment": "#8b5cf6",
  "Bills & Utilities": "#ef4444",
  "Healthcare": "#10b981",
  "Education": "#06b6d4",
  "Travel": "#f59e0b",
  "Home & Garden": "#84cc16",
  "Personal Care": "#d946ef",
  "Business": "#6366f1",
  "Other": "#64748b",
};

export default function Charts() {
  const { getMonthlyTrend, getExpensesByCategory } = useExpense();

  const monthlyTrend = useMemo(() => getMonthlyTrend(), [getMonthlyTrend]);
  const expensesByCategory = useMemo(() => getExpensesByCategory(), [getExpensesByCategory]);

  const monthLabels = monthlyTrend.map((item) => {
    const [year, month] = item.month.split("-");
    return new Date(year, month - 1).toLocaleDateString("en-US", {
      month: "short",
    });
  });

  const barChartData = {
    labels: monthLabels,
    datasets: [
      {
        label: "Income",
        data: monthlyTrend.map((item) => item.income),
        backgroundColor: "rgba(16, 185, 129, 0.8)",
        borderColor: "rgb(16, 185, 129)",
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: "Expenses",
        data: monthlyTrend.map((item) => item.expenses),
        backgroundColor: "rgba(239, 68, 68, 0.8)",
        borderColor: "rgb(239, 68, 68)",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return "$" + value.toLocaleString();
          },
        },
      },
    },
  };

  const categoryLabels = Object.keys(expensesByCategory);
  const categoryValues = Object.values(expensesByCategory);

  const doughnutChartData = {
    labels: categoryLabels,
    datasets: [
      {
        data: categoryValues,
        backgroundColor: categoryLabels.map(
          (cat) => categoryColors[cat] || "#64748b"
        ),
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          boxWidth: 12,
          padding: 15,
        },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {monthlyTrend.length > 0 ? (
              <Bar data={barChartData} options={barChartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expense Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {categoryLabels.length > 0 ? (
              <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No expenses recorded
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
