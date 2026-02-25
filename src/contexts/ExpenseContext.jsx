import { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import { getExpenses, createExpense, updateExpense as updateExpenseApi, deleteExpense as deleteExpenseApi, uploadReceipt as uploadReceiptApi } from "../api/expenseApi";
import { getIncomes, createIncome, updateIncome as updateIncomeApi, deleteIncome as deleteIncomeApi } from "../api/incomeApi";
import { useAuth } from "./AuthContext";

const ExpenseContext = createContext();

const initialState = {
  incomes: [],
  expenses: [],
  loading: false,
  error: null,
};

function expenseReducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "SET_INCOMES":
      return { ...state, incomes: Array.isArray(action.payload) ? action.payload : [] };
    case "SET_EXPENSES":
      return { ...state, expenses: Array.isArray(action.payload) ? action.payload : [] };
    case "ADD_INCOME":
      return { ...state, incomes: [action.payload, ...(Array.isArray(state.incomes) ? state.incomes : [])] };
    case "ADD_EXPENSE":
      return { ...state, expenses: [action.payload, ...(Array.isArray(state.expenses) ? state.expenses : [])] };
    case "UPDATE_INCOME":
      return {
        ...state,
        incomes: (Array.isArray(state.incomes) ? state.incomes : []).map((i) =>
          i._id === action.payload._id ? action.payload : i
        ),
      };
    case "UPDATE_EXPENSE":
      return {
        ...state,
        expenses: (Array.isArray(state.expenses) ? state.expenses : []).map((e) =>
          e._id === action.payload._id ? action.payload : e
        ),
      };
    case "DELETE_INCOME":
      return {
        ...state,
        incomes: (Array.isArray(state.incomes) ? state.incomes : []).filter((i) => i._id !== action.payload),
      };
    case "DELETE_EXPENSE":
      return {
        ...state,
        expenses: (Array.isArray(state.expenses) ? state.expenses : []).filter((e) => e._id !== action.payload),
      };
    case "CLEAR_DATA":
      return { ...initialState };
    default:
      return state;
  }
}

export function ExpenseProvider({ children }) {
  const [state, dispatch] = useReducer(expenseReducer, initialState);
  const { isAuthenticated } = useAuth();

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const [incomesData, expensesData] = await Promise.all([
        getIncomes(),
        getExpenses(),
      ]);
      dispatch({ type: "SET_INCOMES", payload: incomesData });
      dispatch({ type: "SET_EXPENSES", payload: expensesData });
      dispatch({ type: "SET_LOADING", payload: false });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addIncome = async (data) => {
    try {
      const income = await createIncome(data);
      dispatch({ type: "ADD_INCOME", payload: income });
      return { success: true, data: income };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to add income" };
    }
  };

  const updateIncome = async (id, data) => {
    try {
      const income = await updateIncomeApi(id, data);
      dispatch({ type: "UPDATE_INCOME", payload: income });
      return { success: true, data: income };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to update income" };
    }
  };

  const deleteIncome = async (id) => {
    try {
      await deleteIncomeApi(id);
      dispatch({ type: "DELETE_INCOME", payload: id });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to delete income" };
    }
  };

  const addExpense = async (data) => {
    try {
      const expense = await createExpense(data);
      dispatch({ type: "ADD_EXPENSE", payload: expense });
      return { success: true, data: expense };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to add expense" };
    }
  };

  const updateExpense = async (id, data) => {
    try {
      const expense = await updateExpenseApi(id, data);
      dispatch({ type: "UPDATE_EXPENSE", payload: expense });
      return { success: true, data: expense };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to update expense" };
    }
  };

  const deleteExpense = async (id) => {
    try {
      await deleteExpenseApi(id);
      dispatch({ type: "DELETE_EXPENSE", payload: id });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to delete expense" };
    }
  };

  const uploadReceipt = async (expenseId, file) => {
    try {
      const result = await uploadReceiptApi(expenseId, file);
      dispatch({ type: "UPDATE_EXPENSE", payload: result });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to upload receipt" };
    }
  };

  const refreshData = () => {
    fetchData();
  };

  const getTotalIncome = () => {
    if (!Array.isArray(state.incomes)) return 0;
    return state.incomes.reduce((sum, income) => sum + income.amount, 0);
  };

  const getTotalExpenses = () => {
    if (!Array.isArray(state.expenses)) return 0;
    return state.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getBalance = () => {
    return getTotalIncome() - getTotalExpenses();
  };

  const getRecentTransactions = (limit = 10) => {
    const incomesArr = Array.isArray(state.incomes) ? state.incomes : [];
    const expensesArr = Array.isArray(state.expenses) ? state.expenses : [];
    const transactions = [
      ...incomesArr.map((i) => ({ ...i, type: "income" })),
      ...expensesArr.map((e) => ({ ...e, type: "expense" })),
    ];
    return transactions
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  };

  const getExpensesByCategory = () => {
    const categories = {};
    if (Array.isArray(state.expenses)) {
      state.expenses.forEach((expense) => {
        if (!categories[expense.category]) {
          categories[expense.category] = 0;
        }
        categories[expense.category] += expense.amount;
      });
    }
    return categories;
  };

  const getIncomesByCategory = () => {
    const categories = {};
    if (Array.isArray(state.incomes)) {
      state.incomes.forEach((income) => {
        if (!categories[income.category]) {
          categories[income.category] = 0;
        }
        categories[income.category] += income.amount;
      });
    }
    return categories;
  };

  const getMonthlyTrend = () => {
    const months = {};
    const now = new Date();
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      months[key] = { income: 0, expenses: 0 };
    }

    if (Array.isArray(state.incomes)) {
      state.incomes.forEach((income) => {
        const date = new Date(income.createdAt);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (months[key]) {
          months[key].income += income.amount;
        }
      });
    }

    if (Array.isArray(state.expenses)) {
      state.expenses.forEach((expense) => {
        const date = new Date(expense.createdAt);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (months[key]) {
          months[key].expenses += expense.amount;
        }
      });
    }

    return Object.entries(months).map(([month, data]) => ({
      month,
      ...data,
    }));
  };

  return (
    <ExpenseContext.Provider
      value={{
        ...state,
        addIncome,
        updateIncome,
        deleteIncome,
        addExpense,
        updateExpense,
        deleteExpense,
        uploadReceipt,
        refreshData,
        getTotalIncome,
        getTotalExpenses,
        getBalance,
        getRecentTransactions,
        getExpensesByCategory,
        getIncomesByCategory,
        getMonthlyTrend,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpense() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpense must be used within an ExpenseProvider");
  }
  return context;
}
