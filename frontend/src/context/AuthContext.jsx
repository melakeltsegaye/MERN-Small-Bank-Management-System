import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, logoutUser, fetchMe, registerUser } from "../api/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { user } = await fetchMe();
        setUser(user);
      } catch (err) {
        localStorage.removeItem("accessToken");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (email, password) => {
    const data = await loginUser({ email, password });
    localStorage.setItem("accessToken", data.accessToken);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    return registerUser(payload);
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      // ignore
    }
    localStorage.removeItem("accessToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
