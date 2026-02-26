// Goals API - http://localhost:5000/api/goals
// const API_BASE_URL = 'http://localhost:5000/api';
const API_BASE_URL = 'https://expense-tracker-backend-blush-pi.vercel.app/api';

// Get JWT token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Get all goals
export const getGoals = async () => {
  const response = await fetch(`${API_BASE_URL}/goals`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch goals');
  const data = await response.json();
  return data.goals || [];
};

// Get single goal by ID
export const getGoalById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch goal');
  return response.json();
};

// Create a new goal
export const createGoal = async (goalData) => {
  const response = await fetch(`${API_BASE_URL}/goals`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(goalData),
  });
  if (!response.ok) throw new Error('Failed to create goal');
  return response.json();
};

// Update a goal
export const updateGoal = async (id, goalData) => {
  const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(goalData),
  });
  if (!response.ok) throw new Error('Failed to update goal');
  return response.json();
};

// Delete a goal
export const deleteGoal = async (id) => {
  const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete goal');
  return response.json();
};