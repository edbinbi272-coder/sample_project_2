import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api.js";

const AuthContext = createContext(null);

/** Share the current account and sign-in actions with every page. */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("readers-paradise-token");
    if (!token) {
      setIsLoading(false);
      return undefined;
    }
    api.get("/auth/me")
      .then(({ data }) => { if (active) setUser(data); })
      .catch(() => { localStorage.removeItem("readers-paradise-token"); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const clearSession = () => setUser(null);
    window.addEventListener("readers-paradise:session-expired", clearSession);
    return () => window.removeEventListener("readers-paradise:session-expired", clearSession);
  }, []);

  async function login(username_or_email, password) {
    const { data } = await api.post("/auth/login", { username_or_email, password });
    localStorage.setItem("readers-paradise-token", data.access_token);
    setUser(data.user);
    return data.user;
  }

  async function register(account) {
    const { data } = await api.post("/auth/register", account);
    return data;
  }

  function logout() {
    localStorage.removeItem("readers-paradise-token");
    setUser(null);
  }

  const value = useMemo(() => ({ user, isLoading, login, register, logout }), [user, isLoading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
}
