import React, { useState } from "react";
import { useExpense } from "../contexts/ExpenseContext";
import { uploadReceipt } from "../api/expenseApi";
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
  CreditCard,
  Utensils,
  Car,
  ShoppingBag,
  Tv,
  Lightbulb,
  Heart,
  GraduationCap,
  Plane,
  Home,
  Sparkles,
  Briefcase,
  MoreHorizontal,
  Download,
  Loader2
} from "lucide-react";


function Expenses() {
  const { expenses, addExpense, deleteExpense, updateExpense, uploadReceipt, loading, getExpensesByCategory, refreshData } = useExpense();
  const { showNotification } = useNotification();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Debug: Log fetched expenses
  React.useEffect(() => {
    console.log("[UI] Expenses shown:", expenses);
  }, [expenses]);

  // Add Expense
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !amount || !category || !date) {
      showNotification("error", "Please fill in all required fields");
      return;
    }
    if (parseFloat(amount) <= 0) {
      showNotification("error", "Amount must be greater than 0");
      return;
    }
    setIsSubmitting(true);
    const result = await addExpense({
      title,
      amount: parseFloat(amount),
      category,
      date,
      description,
    });
    if (result.success) {
      // Always refresh from backend to ensure valid data
      await refreshData();
      showNotification("success", "Expense added successfully!");
      setTitle("");
      setAmount("");
      setCategory("");
      setDescription("");
      setDate(new Date().toISOString().slice(0, 10));
    } else {
      showNotification("error", result.error);
    }
    setIsSubmitting(false);
  };

  // Delete Expense
  const handleDelete = async (id) => {
    const result = await deleteExpense(id);
    if (result.success) {
      showNotification("success", "Expense deleted");
    } else {
      showNotification("error", result.error);
    }
  };

  // Edit Expense Modal
  const handleEditOpen = (expense) => {
    setEditExpense(expense);
    setEditTitle(expense.title);
    setEditAmount(expense.amount.toString());
    setEditCategory(expense.category);
    setEditDescription(expense.description || "");
  };
  const handleEditClose = () => {
    setEditExpense(null);
    setEditTitle("");
    setEditAmount("");
    setEditCategory("");
    setEditDescription("");
    setEditLoading(false);
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    const result = await updateExpense(editExpense._id, {
      title: editTitle,
      amount: parseFloat(editAmount),
      category: editCategory,
      description: editDescription,
    });
    setEditLoading(false);
    if (result.success) {
      showNotification("success", "Expense updated successfully!");
      handleEditClose();
    } else {
      showNotification("error", result.error);
    }
  };

  // Upload Receipt
  const handleReceiptUpload = async (expenseId, file) => {
    if (!file) return;
    try {
      await uploadReceipt(expenseId, file);
      showNotification("success", "Receipt uploaded successfully!");
    } catch (error) {
      showNotification("error", error.response?.data?.message || "Failed to upload receipt");
    }
  };

  // Category summary
  const expensesByCategory = getExpensesByCategory();
  const expenseCategories = [
    { value: "Food", label: "Food", icon: Utensils },
    { value: "Transport", label: "Transport", icon: Car },
    { value: "Shopping", label: "Shopping", icon: ShoppingBag },
    { value: "Entertainment", label: "Entertainment", icon: Tv },
    { value: "Utilities", label: "Utilities", icon: Lightbulb },
    { value: "Healthcare", label: "Healthcare", icon: Heart },
    { value: "Education", label: "Education", icon: GraduationCap },
    { value: "Travel", label: "Travel", icon: Plane },
    { value: "Housing", label: "Housing", icon: Home },
    { value: "Personal", label: "Personal", icon: Sparkles },
    { value: "Work", label: "Work", icon: Briefcase },
    // Add more as needed
  ];
  const getCategoryIcon = (categoryName) => {
    const cat = expenseCategories.find((c) => c.value === categoryName);
    return cat ? cat.icon : MoreHorizontal;
  };

  // Export to Excel (optional, requires xlsx lib)
  // ...existing code for export if needed...

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
          <h1 className="text-2xl lg:text-3xl font-bold">Expenses</h1>
          <p className="text-muted-foreground">Track and manage your expenses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Expense Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Expense
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Grocery Shopping"
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
                    {expenseCategories.map((cat) => (
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
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  disabled={isSubmitting}
                />
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
                    Add Expense
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Expense List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Expense History</CardTitle>
          </CardHeader>
          <CardContent>
            {Array.isArray(expenses) && expenses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No expenses recorded yet</p>
                <p className="text-sm mt-1">Add your first expense to get started</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-125 overflow-y-auto scrollbar-thin">
                {Array.isArray(expenses) && expenses.map((expense) => {
                  const CategoryIcon = getCategoryIcon(expense.category);
                  return (
                    <div
                      key={expense._id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                          <CategoryIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{expense.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {expense.category} • {formatDate(expense.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-destructive">
                          -{formatCurrency(expense.amount)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(expense._id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          onClick={() => handleEditOpen(expense)}
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 1 1 3.182 3.182L7.5 19.213l-4 1 1-4 12.362-12.726z" />
                          </svg>
                        </Button>
                        {/* Edit Expense Modal */}
                        {editExpense && editExpense._id === expense._id && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 w-full max-w-md">
                              <h2 className="text-lg font-bold mb-4">Edit Expense</h2>
                              <form onSubmit={handleEditSubmit} className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-title">Title</Label>
                                  <Input
                                    id="edit-title"
                                    value={editTitle}
                                    onChange={e => setEditTitle(e.target.value)}
                                    disabled={editLoading}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-amount">Amount</Label>
                                  <Input
                                    id="edit-amount"
                                    type="number"
                                    value={editAmount}
                                    onChange={e => setEditAmount(e.target.value)}
                                    min="0"
                                    step="0.01"
                                    disabled={editLoading}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-category">Category</Label>
                                  <Select
                                    value={editCategory}
                                    onValueChange={setEditCategory}
                                    disabled={editLoading}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {expenseCategories.map((cat) => (
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
                                  <Label htmlFor="edit-description">Description (optional)</Label>
                                  <Textarea
                                    id="edit-description"
                                    value={editDescription}
                                    onChange={e => setEditDescription(e.target.value)}
                                    disabled={editLoading}
                                  />
                                </div>
                                <div className="flex gap-2 justify-end">
                                  <Button type="button" variant="outline" onClick={handleEditClose} disabled={editLoading}>Cancel</Button>
                                  <Button type="submit" disabled={editLoading}>
                                    {editLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Save Changes
                                  </Button>
                                </div>
                              </form>
                            </div>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          id={`receipt-upload-${expense._id}`}
                          onChange={e => handleReceiptUpload(expense._id, e.target.files[0])}
                        />
                        <label htmlFor={`receipt-upload-${expense._id}`} className="cursor-pointer text-xs text-primary underline ml-2">
                          Upload Receipt
                        </label>
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
      {Object.keys(expensesByCategory).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {Object.entries(expensesByCategory).map(([category, amount]) => {
                const CategoryIcon = getCategoryIcon(category);
                return (
                  <div
                    key={category}
                    className="p-4 rounded-lg bg-muted/50 text-center"
                  >
                    <div className="p-2 rounded-lg bg-destructive/10 text-destructive w-fit mx-auto mb-2">
                      <CategoryIcon className="h-5 w-5" />
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{category}</p>
                    <p className="font-semibold text-destructive">
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



export default Expenses;

