import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, Badge } from "../ui/primitives";
import { useAuth } from "../auth/AuthContext";
import { useToasts } from "../ui/ToastProvider";

// PUBLIC_INTERFACE
export default function SignUpPage() {
  /** Sign-up route: /signup */
  const { signUp } = useAuth();
  const toasts = useToasts();
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await signUp({ name, email, password });
      toasts.show({ type: "success", title: "Account created", message: "Now let’s build your first streak." });
      nav("/dashboard");
    } catch (err) {
      toasts.show({
        type: "error",
        title: "Sign up failed",
        message: err?.message || "Please try again or check backend status.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="hero">
          <h1>Create your Candy Pop tracker</h1>
          <p>
            Build habits that stick. Add categories, set frequencies, and watch your progress sparkle across time.
          </p>
          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Badge tone="primary">Retro vibe</Badge>
            <Badge tone="secondary">Smart insights</Badge>
            <Badge tone="success">Streak rewards</Badge>
          </div>
          <div className="hr" />
          <p style={{ margin: 0, fontSize: 13, color: "rgba(17,24,39,0.72)" }}>
            Tip: Use a memorable category like <strong>Health</strong> or <strong>Learning</strong> to make filtering fun.
          </p>
        </div>

        <Card>
          <h2 className="card-title">Sign up</h2>
          <p className="card-subtitle">Create an account to start tracking.</p>

          <form onSubmit={onSubmit} className="form-row">
            <label>
              <div style={{ fontWeight: 800, fontSize: 12, marginBottom: 6 }}>Name</div>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>

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
                minLength={6}
                required
              />
              <div className="helper">Minimum 6 characters.</div>
            </label>

            <Button variant="primary" size="lg" type="submit" disabled={busy}>
              {busy ? "Creating…" : "Create account"}
            </Button>

            <p className="helper">
              Already have an account? <Link to="/signin">Sign in</Link>.
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
