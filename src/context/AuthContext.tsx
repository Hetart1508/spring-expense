import React, { createContext, useContext, useState } from "react";
import api from "../api";
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (name: string, password: string) => Promise<User>;
  register: (name: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_USER_KEY = "java_expense_user";

const getStoredUser = (): User | null => {
  const storedUser = localStorage.getItem(AUTH_USER_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as User;
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
};

const storeUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_USER_KEY);
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateUser = (nextUser: User) => {
    setUser(nextUser);
    storeUser(nextUser);
  };

  const login = async (name: string, password: string): Promise<User> => {
    try {
      setError(null);
      const res = await api.post<User>("/auth/login", { name, password });
      updateUser(res.data);
      return res.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Invalid username or password";
      setError(msg);
      throw new Error(msg);
    }
  };

  const register = async (name: string, password: string): Promise<User> => {
    try {
      setError(null);
      const res = await api.post<User>("/auth/register", { name, password });
      return res.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Username already exists";
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout failed on server side, clearing local state", err);
    } finally {
      setUser(null);
      storeUser(null);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
