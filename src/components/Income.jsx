import React from "react";
import { useState } from "react";
import { useExpense } from "../contexts/ExpenseContext";
import { useNotification } from "../context/NotificationContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Plus,
  Trash2,
  Wallet,
  Briefcase,
  Building,
  TrendingUp,
  Home,
  Gift,
  MoreHorizontal,
  Download,
  Loader2,
} from "lucide-react";
import * as XLSX from "xlsx";

const incomeCategories = [
  { value: "Salary", label: "Salary", icon: Briefcase },
  { value: "Freelance", label: "Freelance", icon: Wallet },
  { value: "Business", label: "Business", icon: Building },
  { value: "Investment", label: "Investment", icon: TrendingUp },
  { value: "Rental", label: "Rental", icon: Home },
  { value: "Gift", label: "Gift", icon: Gift },
  { value: "Other", label: "Other", icon: MoreHorizontal },
];

export default function Income() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { incomes, addIncome, deleteIncome, loading, getIncomesByCategory, refreshData } = useExpense();
  const { showNotification } = useNotification();


  // Debug: Log fetched incomes
  React.useEffect(() => {
    console.log("[UI] Incomes shown:", incomes);
  }, [incomes]);

  // Force refresh on mount
  React.useEffect(() => {
    refreshData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !amount || !category) {
      showNotification("error", "Please fill in all required fields");
      return;
    }

    if (parseFloat(amount) <= 0) {
      showNotification("error", "Amount must be greater than 0");
      return;
    }

    setIsSubmitting(true);
    const result = await addIncome({
      title,
      amount: parseFloat(amount),
      category,
      description,
    });
    if (result.success) {
      // Always refresh from backend to ensure valid data
      await refreshData();
      showNotification("success", "Income added successfully!");
      setTitle("");
      setAmount("");
      setCategory("");
      setDescription("");
    } else {
      showNotification("error", result.error);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id) => {
    const result = await deleteIncome(id);
    if (result.success) {
      showNotification("success", "Income deleted");
    } else {
      showNotification("error", result.error);
    }
  };

  const exportToExcel = () => {

    if (!Array.isArray(incomes) || incomes.length === 0) {
      showNotification("warning", "No income data to export");
      return;
    }

    const data = incomes.map((income) => ({
      Title: income.title,
      Amount: income.amount,
      Category: income.category,
      Description: income.description || "",
      Date: formatDate(income.createdAt),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Income");
    XLSX.writeFile(wb, "income-report.xlsx");
    showNotification("success", "Income data exported successfully!");
  };

  const incomesByCategory = getIncomesByCategory();

  const getCategoryIcon = (categoryName) => {
    const cat = incomeCategories.find((c) => c.value === categoryName);
    return cat ? cat.icon : MoreHorizontal;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Income</h1>
          <p className="text-muted-foreground">Track and manage your income sources</p>
        </div>
        <Button onClick={exportToExcel} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export to Excel
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Income Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Monthly Salary"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={category}
                  onValueChange={setCategory}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {incomeCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <cat.icon className="h-4 w-4" />
                          {cat.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add any notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Income
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Income List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Income History</CardTitle>
          </CardHeader>
          <CardContent>
            {Array.isArray(incomes) && incomes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No income recorded yet</p>
                <p className="text-sm mt-1">Add your first income to get started</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-125 overflow-y-auto scrollbar-thin">
                {Array.isArray(incomes) && incomes.map((income) => {
                  const CategoryIcon = getCategoryIcon(income.category);
                  return (
                    <div
                      key={income._id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-success/10 text-success">
                          <CategoryIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{income.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {income.category} • {formatDate(income.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-success">
                          +{formatCurrency(income.amount)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(income._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Summary */}
      {Object.keys(incomesByCategory).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Income by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(incomesByCategory).map(([category, amount]) => {
                const CategoryIcon = getCategoryIcon(category);
                return (
                  <div
                    key={category}
                    className="p-4 rounded-lg bg-muted/50 text-center"
                  >
                    <div className="p-2 rounded-lg bg-success/10 text-success w-fit mx-auto mb-2">
                      <CategoryIcon className="h-5 w-5" />
                    </div>
                    <p className="text-sm text-muted-foreground">{category}</p>
                    <p className="font-semibold text-success">
                      {formatCurrency(amount)}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
