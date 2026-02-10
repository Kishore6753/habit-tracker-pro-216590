import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Card, Badge } from "../ui/primitives";
import { useAuth } from "../auth/AuthContext";
import { useToasts } from "../ui/ToastProvider";

function getRedirectPath(state) {
  if (state && typeof state.from === "string") return state.from;
  return "/dashboard";
}

// PUBLIC_INTERFACE
export default function SignInPage() {
  /** Sign-in route: /signin */
  const { signIn } = useAuth();
  const toasts = useToasts();
  const nav = useNavigate();
  const loc = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await signIn({ email, password });
      toasts.show({ type: "success", title: "Welcome back!", message: "Let’s keep your streak going." });
      nav(getRedirectPath(loc.state));
    } catch (err) {
      toasts.show({
        type: "error",
        title: "Sign in failed",
        message: err?.message || "Please check your credentials or backend status.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="hero">
          <h1>Welcome back</h1>
          <p>
            Track daily, weekly, and monthly habits with a playful retro vibe. Earn streak badges and watch your progress pop.
          </p>

          <div className="kpi-row" aria-label="Highlights">
            <div className="kpi">
              <strong>Streaks</strong>
              <span>Keep momentum</span>
            </div>
            <div className="kpi">
              <strong>Calendar</strong>
              <span>See patterns</span>
            </div>
            <div className="kpi">
              <strong>Charts</strong>
              <span>Get insights</span>
            </div>
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Badge tone="primary">Primary #F472B6</Badge>
            <Badge tone="secondary">Secondary #A78BFA</Badge>
            <Badge tone="success">Success #10B981</Badge>
          </div>
        </div>

        <Card>
          <h2 className="card-title">Sign in</h2>
          <p className="card-subtitle">Use your account to access your dashboard.</p>

          <form onSubmit={onSubmit} className="form-row">
            <label>
              <div style={{ fontWeight: 800, fontSize: 12, marginBottom: 6 }}>Email</div>
              <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
            </label>

            <label>
              <div style={{ fontWeight: 800, fontSize: 12, marginBottom: 6 }}>Password</div>
              <input
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
              />
            </label>

            <Button variant="primary" size="lg" type="submit" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </Button>

            <p className="helper">
              No account yet? <Link to="/signup">Create one</Link>.
            </p>

            <p className="helper">
              Backend base URL: <code>{process.env.REACT_APP_API_BASE_URL || "http://localhost:3001"}</code>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
