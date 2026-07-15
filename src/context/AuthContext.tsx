import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api";
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (name: string, password: string) => Promise<User>;
  register: (name: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const res = await api.get<User>("/auth/me");
      setUser(res.data);
      setError(null);
    } catch (err: any) {
      // It's normal to fail on startup if the user is unauthenticated
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (name: string, password: string): Promise<User> => {
    try {
      setError(null);
      const res = await api.post<User>("/auth/login", { name, password });
      setUser(res.data);
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
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.get<User>("/auth/me");
      setUser(res.data);
    } catch (err) {
      setUser(null);
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
        refreshUser,
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
