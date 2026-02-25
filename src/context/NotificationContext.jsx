import { createContext, useContext, useCallback } from "react";
import toast from "react-hot-toast";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const showNotification = useCallback((type, message, duration = 4000) => {
    const options = {
      duration,
      position: "top-right",
    };

    switch (type) {
      case "success":
        toast.success(message, options);
        break;
      case "error":
        toast.error(message, options);
        break;
      case "warning":
        toast(message, {
          ...options,
          icon: "⚠️",
        });
        break;
      default:
        toast(message, options);
    }
  }, []);

  const removeNotification = useCallback((id) => {
    toast.dismiss(id);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        removeNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
