import { createContext, useContext, useReducer, useEffect } from "react";
import {
  loginUser,
  registerUser,
  getCurrentUser,
  updateUser as updateUserApi,
  deleteUser,
  uploadImage,
} from "../api/userApi";

const AuthContext = createContext();

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case "AUTH_START":
      return { ...state, loading: true, error: null };
    case "AUTH_SUCCESS":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case "AUTH_FAILURE":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
      };
    case "UPDATE_USER":
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (token) {
        try {
          // Try to fetch current user from backend for silent re-auth
          const data = await getCurrentUser();
          console.log('[AuthContext] getCurrentUser() response:', data);
          // If data.data exists, use it; else, use data.user or data directly
          const userObj = data.data || data.user || data;
          localStorage.setItem("user", JSON.stringify(userObj));
          dispatch({
            type: "AUTH_SUCCESS",
            payload: { user: userObj, token },
          });
        } catch (err) {
          // Token invalid/expired, clear storage and set loading false
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          dispatch({ type: "SET_LOADING", payload: false });
        }
      } else if (token && storedUser) {
        // Fallback: use stored user if available (legacy)
        try {
          const user = JSON.parse(storedUser);
          dispatch({
            type: "AUTH_SUCCESS",
            payload: { user, token },
          });
        } catch {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          dispatch({ type: "SET_LOADING", payload: false });
        }
      } else {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    dispatch({ type: "AUTH_START" });
    try {
      const data = await loginUser({ email, password });
      localStorage.setItem("token", data.token);
      // Immediately fetch the real user from backend
      const userData = await getCurrentUser();
      const userObj = userData.data || userData.user || userData;
      localStorage.setItem("user", JSON.stringify(userObj));
      dispatch({
        type: "AUTH_SUCCESS",
        payload: { user: userObj, token: data.token },
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      dispatch({ type: "AUTH_FAILURE", payload: message });
      return { success: false, error: message };
    }
  };

  const register = async (name, email, password, profilePicture, coverPicture) => {
    dispatch({ type: "AUTH_START" });
    try {
      let profilePictureUrl = null;
      let coverPictureUrl = null;

      if (profilePicture) {
        const uploadResult = await uploadImage(profilePicture);
        profilePictureUrl = uploadResult.url;
      }

      if (coverPicture) {
        const uploadResult = await uploadImage(coverPicture);
        coverPictureUrl = uploadResult.url;
      }

      const userData = {
        name,
        email,
        password,
        ...(profilePictureUrl && { profilePicture: profilePictureUrl }),
        ...(coverPictureUrl && { coverPicture: coverPictureUrl }),
      };

      await registerUser(userData);
      // Do not auto-login after registration
      dispatch({ type: "SET_LOADING", payload: false });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      dispatch({ type: "AUTH_FAILURE", payload: message });
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch({ type: "LOGOUT" });
  };

  const updateUser = async (updates) => {
    try {
      console.log('[AuthContext] updateUser called with:', updates);
      const data = await updateUserApi(state.user._id, updates);
      console.log('[AuthContext] updateUser API response:', data);
      localStorage.setItem("user", JSON.stringify(data.user || data.data || data));
      dispatch({ type: "UPDATE_USER", payload: data.user || data.data || data });
      return { success: true };
    } catch (error) {
      console.error('[AuthContext] updateUser error:', error);
      const message = error.response?.data?.message || "Update failed";
      return { success: false, error: message };
    }
  };

  const deleteAccount = async () => {
    try {
      console.log('[AuthContext] deleteAccount called for user ID:', state.user?._id);
      const response = await deleteUser(state.user._id);
      console.log('[AuthContext] deleteAccount API response:', response);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      dispatch({ type: "LOGOUT" });
      return { success: true };
    } catch (error) {
      console.error('[AuthContext] deleteAccount error:', error);
      const message = error.response?.data?.message || "Delete failed";
      return { success: false, error: message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateUser,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
