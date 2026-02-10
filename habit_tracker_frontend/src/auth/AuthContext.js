import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AuthApi } from "../api/client";

const TOKEN_KEY = "habit_tracker_token";

const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export function useAuth() {
  /** Hook to access authentication state and actions. */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider />");
  return ctx;
}

function readStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function storeToken(token) {
  try {
    if (!token) localStorage.removeItem(TOKEN_KEY);
    else localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

// PUBLIC_INTERFACE
export function AuthProvider({ children, onToast }) {
  /** Provides auth state and actions; persists token in localStorage. */
  const [token, setToken] = useState(() => readStoredToken());
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const setSession = useCallback((nextToken, nextUser) => {
    setToken(nextToken);
    storeToken(nextToken);
    setUser(nextUser || null);
  }, []);

  const refreshMe = useCallback(async () => {
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const me = await AuthApi.me(token);
      setUser(me?.user || me || null);
    } catch (e) {
      // Token likely invalid; clear session.
      setSession(null, null);
      onToast?.({ type: "error", title: "Session expired", message: "Please sign in again." });
    }
  }, [token, setSession, onToast]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setIsBootstrapping(true);
      try {
        if (token) await refreshMe();
      } finally {
        if (alive) setIsBootstrapping(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [token, refreshMe]);

  const signIn = useCallback(
    async ({ email, password }) => {
      const res = await AuthApi.signIn({ email, password });
      const nextToken = res?.token || res?.accessToken || res?.jwt;
      const nextUser = res?.user || null;
      if (!nextToken) throw new Error("Login succeeded but no token returned by API.");
      setSession(nextToken, nextUser);
      return res;
    },
    [setSession]
  );

  const signUp = useCallback(
    async ({ name, email, password }) => {
      const res = await AuthApi.signUp({ name, email, password });
      const nextToken = res?.token || res?.accessToken || res?.jwt;
      const nextUser = res?.user || null;
      // Some backends return token on signup; accept it if present.
      if (nextToken) setSession(nextToken, nextUser);
      return res;
    },
    [setSession]
  );

  const signOut = useCallback(() => {
    setSession(null, null);
  }, [setSession]);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      isBootstrapping,
      signIn,
      signUp,
      signOut,
      refreshMe,
      setSession,
    }),
    [token, user, isBootstrapping, signIn, signUp, signOut, refreshMe, setSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
