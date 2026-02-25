
// Income API - http://localhost:5000/api/incomes
const API_BASE_URL = 'http://localhost:5000/api';

// Get JWT token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Get all incomes
export const getIncomes = async () => {
  const response = await fetch(`${API_BASE_URL}/incomes`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch incomes');
  const data = await response.json();
  return data.incomes || [];
};

// Get income statistics
export const getIncomeStats = async () => {
  const response = await fetch(`${API_BASE_URL}/incomes/stats`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch income stats');
  return response.json();
};

// Get single income by ID
export const getIncomeById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/incomes/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch income');
  return response.json();
};

// Create a new income
export const createIncome = async (incomeData) => {
  const response = await fetch(`${API_BASE_URL}/incomes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(incomeData),
  });
  if (!response.ok) throw new Error('Failed to create income');
  return response.json();
};

// Update an income
export const updateIncome = async (id, incomeData) => {
  const response = await fetch(`${API_BASE_URL}/incomes/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(incomeData),
  });
  if (!response.ok) throw new Error('Failed to update income');
  return response.json();
};

// Delete an income
export const deleteIncome = async (id) => {
  const response = await fetch(`${API_BASE_URL}/incomes/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete income');
  return response.json();
};
