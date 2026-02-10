import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

/**
 * PUBLIC_INTERFACE
 * Enforces authentication for protected routes.
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return (
      <div className="auth-wrap">
        <div className="card" style={{ width: "min(520px, 100%)" }}>
          <h2 className="card-title">Loading your Candy Pop session…</h2>
          <p className="card-subtitle">Checking saved login.</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  return children;
}
