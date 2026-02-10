import React from "react";

// PUBLIC_INTERFACE
export function Button({ variant = "default", size = "md", className = "", ...props }) {
  /** Reusable themed button. */
  const v =
    variant === "primary"
      ? "btn-primary"
      : variant === "success"
        ? "btn-success"
        : variant === "danger"
          ? "btn-danger"
          : variant === "ghost"
            ? "btn-ghost"
            : "";
  const s = size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "";
  return <button className={`btn ${v} ${s} ${className}`.trim()} {...props} />;
}

// PUBLIC_INTERFACE
export function Card({ className = "", children, ...props }) {
  /** Surface container for content. */
  return (
    <section className={`card ${className}`.trim()} {...props}>
      {children}
    </section>
  );
}

// PUBLIC_INTERFACE
export function Badge({ tone = "default", className = "", children }) {
  /** Small badge for labels and status. */
  const t =
    tone === "primary"
      ? "badge-primary"
      : tone === "secondary"
        ? "badge-secondary"
        : tone === "success"
          ? "badge-success"
          : tone === "error"
            ? "badge-error"
            : "";
  return <span className={`badge ${t} ${className}`.trim()}>{children}</span>;
}
