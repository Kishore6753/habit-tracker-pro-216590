import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

// PUBLIC_INTERFACE
export function useToasts() {
  /** Hook to show toasts from anywhere in the app. */
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToasts must be used within <ToastProvider />");
  return ctx;
}

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

// PUBLIC_INTERFACE
export function ToastProvider({ children }) {
  /** Provides toast stack UI and helper methods. */
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((t) => {
    const toast = {
      id: uid(),
      type: t.type || "info",
      title: t.title || (t.type === "error" ? "Error" : "Heads up"),
      message: t.message || "",
      timeoutMs: typeof t.timeoutMs === "number" ? t.timeoutMs : 4500,
    };
    setToasts((prev) => [toast, ...prev].slice(0, 4));
    if (toast.timeoutMs > 0) {
      window.setTimeout(() => dismiss(toast.id), toast.timeoutMs);
    }
  }, [dismiss]);

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-relevant="additions removals">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            <div className="dot" aria-hidden="true" />
            <div>
              <p className="title">{t.title}</p>
              {t.message ? <p className="msg">{t.message}</p> : null}
            </div>
            <button className="btn btn-sm btn-ghost" onClick={() => dismiss(t.id)} aria-label="Dismiss toast">
              Close
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
