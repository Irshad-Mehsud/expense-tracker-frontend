import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useExpense } from "../contexts/ExpenseContext";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Charts from "./Charts";
import RecentTransactions from "./RecentTransactions";
import { formatCurrency, getGreeting } from "@/lib/utils";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Calendar,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { getTotalIncome, getTotalExpenses, getBalance, loading } = useExpense();

  // Debug: Log user data fetched from user API
  React.useEffect(() => {
    console.log("[UI] Dashboard user:", user);
  }, [user]);

  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const balance = getBalance();
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const stats = [
    {
      title: "Total Balance",
      value: formatCurrency(balance),
      icon: Wallet,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Total Income",
      value: formatCurrency(totalIncome),
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Total Expenses",
      value: formatCurrency(totalExpenses),
      icon: TrendingDown,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      title: "Savings Rate",
      value: `${savingsRate.toFixed(1)}%`,
      icon: PiggyBank,
      color: "text-warning",
      bgColor: "bg-warning/10",
      showProgress: true,
      progress: Math.max(0, Math.min(100, savingsRate)),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* User Info at the top */}
      {user && (
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={user.profilePicture} alt={user.name} />
            <AvatarFallback>{user.name ? user.name[0] : "U"}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">
            {getGreeting()}, {user?.name?.split(" ")[0] || "User"}!
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground mt-1">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{today}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              {stat.showProgress && (
                <div className="mt-4">
                  <Progress value={stat.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.progress >= 20 ? "Great job saving!" : "Try to save more!"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <Charts />

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentTransactions />
        </CardContent>
      </Card>
    </div>
  );
}
