import axios from "axios";

const API_BASE_URL = "https://expense-tracker-backend-blush-pi.vercel.app/api";
// const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
// Only redirect to login for protected endpoints (not /auth/me)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      error.config &&
      !error.config.url.includes("/auth/me")
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Helper to check token
export const checkAuthToken = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("No JWT token found in localStorage.");
  } else {
    console.log("JWT token found:", token);
  }
  return token;
};

export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await api.put(`/auth/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/auth/${userId}`);
  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await api.put("/auth/password", passwordData);
  return response.data;
};

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  const response = await api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Example: Fetch and log all expenses directly
export const fetchAndLogExpenses = async () => {
  try {
    const response = await api.get('/expenses');
    console.log('Direct expenses fetch:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
};

export default api;
