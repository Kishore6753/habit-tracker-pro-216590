import React, { useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button, Badge } from "../ui/primitives";
import { useAuth } from "../auth/AuthContext";

function routeTitle(pathname) {
  if (pathname.startsWith("/dashboard")) return "Dashboard";
  if (pathname.startsWith("/habits")) return "Habits";
  if (pathname.startsWith("/calendar")) return "Calendar";
  if (pathname.startsWith("/analytics")) return "Analytics";
  if (pathname.startsWith("/settings")) return "Settings";
  return "Habit Tracker";
}

function initials(nameOrEmail) {
  const v = (nameOrEmail || "You").trim();
  const parts = v.split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] || "Y";
  const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (a + b).toUpperCase();
}

// PUBLIC_INTERFACE
export function AppLayout({ children }) {
  /** Main authenticated app shell layout. */
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const title = useMemo(() => routeTitle(location.pathname), [location.pathname]);

  const displayName = user?.name || user?.email || "You";
  const avatar = initials(displayName);

  const onLogout = async () => {
    signOut();
    navigate("/signin");
  };

  return (
    <>
      {sidebarOpen ? <div className="backdrop" onClick={() => setSidebarOpen(false)} /> : null}
      <div className="app-shell">
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`} aria-label="Sidebar navigation">
          <div className="brand">
            <div className="brand-badge" aria-hidden="true">{avatar}</div>
            <div className="brand-title">
              <strong>Habit Tracker</strong>
              <span>Candy Pop Edition</span>
            </div>
          </div>

          <nav className="nav">
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              <span className="icon" aria-hidden="true">🏁</span>
              Dashboard
            </NavLink>
            <NavLink to="/habits" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              <span className="icon" aria-hidden="true">✨</span>
              Habits
            </NavLink>
            <NavLink to="/calendar" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              <span className="icon" aria-hidden="true">🗓</span>
              Calendar
            </NavLink>
            <NavLink to="/analytics" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              <span className="icon" aria-hidden="true">📈</span>
              Analytics
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              <span className="icon" aria-hidden="true">⚙️</span>
              Settings
            </NavLink>
          </nav>

          <div className="sidebar-footer">
            <div className="card" style={{ padding: 12 }}>
              <p style={{ margin: 0, fontWeight: 900, fontSize: 13 }}>{displayName}</p>
              <p style={{ margin: "4px 0 10px", color: "var(--cp-muted)", fontSize: 12 }}>
                Keep the streak alive.
              </p>
              <Badge tone="primary">Candy Pop</Badge>
            </div>
            <Button variant="ghost" onClick={onLogout}>Logout</Button>
          </div>
        </aside>

        <section className="content">
          <header className="topbar">
            <div className="topbar-left">
              <Button
                className="mobile-menu-btn"
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                Menu
              </Button>
              <div style={{ minWidth: 0 }}>
                <h1 className="page-title">{title}</h1>
                <p className="subtitle">Playful progress, serious results.</p>
              </div>
            </div>
            <div className="topbar-right">
              <Badge tone="secondary">Streak mode</Badge>
              <Button variant="primary" size="sm" onClick={() => navigate("/habits")}>New Habit</Button>
            </div>
          </header>

          <main className="main">{children}</main>
        </section>
      </div>
    </>
  );
}
