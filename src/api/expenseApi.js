import api from "./userApi";

export const getExpenses = async () => {
  const response = await api.get("/expenses");
  return response.data.expenses || [];
};

export const createExpense = async (data) => {
  const response = await api.post("/expenses", data);
  return response.data;
};

export const getExpenseById = async (id) => {
  const response = await api.get(`/expenses/${id}`);
  return response.data;
};

export const updateExpense = async (id, data) => {
  const response = await api.put(`/expenses/${id}`, data);
  return response.data;
};

export const deleteExpense = async (id) => {
  const response = await api.delete(`/expenses/${id}`);
  return response.data;
};

export const getExpenseStats = async () => {
  const response = await api.get("/expenses/stats");
  return response.data;
};

export const uploadReceipt = async (id, file) => {
  const formData = new FormData();
  formData.append("receipt", file);
  const response = await api.post(`/expenses/${id}/receipt`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
