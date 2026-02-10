import React, { useMemo, useState } from "react";
import { Card, Button, Badge } from "../ui/primitives";
import { useAuth } from "../auth/AuthContext";
import { useToasts } from "../ui/ToastProvider";

const ACCENTS = [
  { key: "pink", label: "Pink Pop", primary: "#F472B6", secondary: "#A78BFA" },
  { key: "mint", label: "Mint Spark", primary: "#10B981", secondary: "#60A5FA" },
  { key: "grape", label: "Grape Glow", primary: "#A78BFA", secondary: "#F472B6" },
];

function applyAccent(accent) {
  // Only applies locally; backend user settings can persist later.
  document.documentElement.style.setProperty("--cp-primary", accent.primary);
  document.documentElement.style.setProperty("--cp-secondary", accent.secondary);
}

// PUBLIC_INTERFACE
export default function SettingsPage() {
  /** Settings route: /settings */
  const { user, setSession, token } = useAuth();
  const toasts = useToasts();

  const [name, setName] = useState(user?.name || "");
  const [email] = useState(user?.email || "");
  const [accentKey, setAccentKey] = useState("pink");

  const accent = useMemo(() => ACCENTS.find((a) => a.key === accentKey) || ACCENTS[0], [accentKey]);

  const save = async () => {
    // Placeholder persistence until backend profile endpoints exist.
    applyAccent(accent);
    toasts.show({ type: "success", title: "Saved", message: "Profile basics updated locally (backend persistence next)." });
    setSession(token, { ...(user || {}), name, email });
  };

  return (
    <div className="grid">
      <Card>
        <p className="card-title">Profile</p>
        <p className="card-subtitle">Basics for your account (backend persistence coming soon).</p>

        <div className="form-grid-2">
          <label>
            <div style={{ fontWeight: 900, fontSize: 12, marginBottom: 6 }}>Name</div>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </label>

          <label>
            <div style={{ fontWeight: 900, fontSize: 12, marginBottom: 6 }}>Email</div>
            <input className="input" value={email} readOnly />
            <div className="helper">Email changes will be supported when backend implements it.</div>
          </label>
        </div>

        <div style={{ marginTop: 12 }}>
          <Button variant="primary" onClick={save}>Save changes</Button>
        </div>
      </Card>

      <Card>
        <p className="card-title">Theme accents</p>
        <p className="card-subtitle">Choose an accent that matches your vibe.</p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {ACCENTS.map((a) => (
            <button
              key={a.key}
              className="btn btn-ghost"
              onClick={() => {
                setAccentKey(a.key);
                applyAccent(a);
              }}
              style={{
                borderColor: accentKey === a.key ? "rgba(244,114,182,0.55)" : "rgba(17,24,39,0.10)",
              }}
            >
              <span style={{ fontWeight: 900 }}>{a.label}</span>
              <span style={{ marginLeft: 8, display: "inline-flex", gap: 6, verticalAlign: "middle" }}>
                <span style={{ width: 12, height: 12, borderRadius: 999, background: a.primary }} />
                <span style={{ width: 12, height: 12, borderRadius: 999, background: a.secondary }} />
              </span>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 10 }}>
          <Badge tone="primary">Primary</Badge>{" "}
          <Badge tone="secondary">Secondary</Badge>{" "}
          <Badge tone="success">Success</Badge>{" "}
          <Badge tone="error">Error</Badge>
        </div>
      </Card>
    </div>
  );
}
