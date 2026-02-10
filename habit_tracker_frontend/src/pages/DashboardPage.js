import React, { useEffect, useMemo, useState } from "react";
import { Card, Badge, Button } from "../ui/primitives";
import { HabitsApi } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useToasts } from "../ui/ToastProvider";

const QUOTES = [
  { q: "Small steps every day add up to big results.", a: "Candy Pop Coach" },
  { q: "Consistency beats intensity.", a: "Habit Wisdom" },
  { q: "Make it easy. Make it fun. Make it happen.", a: "Retro Mentor" },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function computeCompletionPct(habits) {
  if (!habits.length) return 0;
  const done = habits.filter((h) => h.isCompletedToday).length;
  return Math.round((done / habits.length) * 100);
}

function streakBadge(streak) {
  if (streak >= 30) return { label: "30+ Legend", tone: "secondary" };
  if (streak >= 14) return { label: "2-week Star", tone: "primary" };
  if (streak >= 7) return { label: "7-day Spark", tone: "success" };
  return { label: "Fresh Start", tone: "default" };
}

// PUBLIC_INTERFACE
export default function DashboardPage() {
  /** Dashboard route: /dashboard */
  const { token } = useAuth();
  const toasts = useToasts();

  const [habits, setHabits] = useState([]);
  const [busy, setBusy] = useState(false);

  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  useEffect(() => {
    let alive = true;
    (async () => {
      setBusy(true);
      try {
        const res = await HabitsApi.list({ token });
        const list = Array.isArray(res?.habits) ? res.habits : Array.isArray(res) ? res : [];
        // Best-effort shape; backend will standardize.
        const enriched = list.map((h) => ({
          ...h,
          streak: h.streak ?? h.currentStreak ?? 0,
          isCompletedToday: Boolean(h.completedToday ?? h.isCompletedToday ?? false),
          frequency: h.frequency || "daily",
        }));
        if (alive) setHabits(enriched);
      } catch (e) {
        // Backend may not be ready; show stub-friendly error.
        toasts.show({
          type: "error",
          title: "Unable to load dashboard data",
          message: e?.message || "Backend API not available yet.",
        });
        if (alive) setHabits([]);
      } finally {
        if (alive) setBusy(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [token, toasts]);

  const todays = habits.filter((h) => (h.frequency || "daily") === "daily");
  const completionPct = computeCompletionPct(todays);
  const totalStreak = habits.reduce((acc, h) => acc + (h.streak || 0), 0);

  return (
    <div className="grid">
      <div className="grid grid-3">
        <Card>
          <p className="card-title">Today ({todayISO()})</p>
          <p className="card-subtitle">Daily habits completion</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <div style={{ fontSize: 34, fontWeight: 950 }}>{completionPct}%</div>
            <Badge tone={completionPct >= 70 ? "success" : "primary"}>{completionPct >= 70 ? "On fire" : "Warming up"}</Badge>
          </div>
          <div className="helper">{todays.filter((h) => h.isCompletedToday).length}/{todays.length} done</div>
        </Card>

        <Card>
          <p className="card-title">Weekly goals</p>
          <p className="card-subtitle">Your momentum this week</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <Badge tone="secondary">3x workouts</Badge>
            <Badge tone="primary">5x reading</Badge>
            <Badge tone="success">7x hydration</Badge>
          </div>
          <div className="helper">Backend will compute goals based on weekly frequency & history.</div>
        </Card>

        <Card>
          <p className="card-title">Monthly progress</p>
          <p className="card-subtitle">A peek at consistency</p>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Badge tone="primary">Streak points: {totalStreak}</Badge>
            <Badge tone="secondary">Badges: {habits.length ? Math.max(1, Math.floor(totalStreak / 10)) : 0}</Badge>
          </div>
          <div className="helper">Backend will supply monthly aggregates + completion % per category.</div>
        </Card>
      </div>

      <div className="grid grid-2">
        <Card>
          <p className="card-title">Motivational quote</p>
          <p className="card-subtitle">A daily spark to keep you moving</p>
          <div style={{ padding: 12, borderRadius: 16, background: "rgba(244,114,182,0.10)", border: "1px solid rgba(244,114,182,0.22)" }}>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 850 }}>&ldquo;{quote.q}&rdquo;</p>
            <p style={{ margin: "8px 0 0", color: "var(--cp-muted)", fontSize: 13 }}>— {quote.a}</p>
          </div>
        </Card>

        <Card>
          <p className="card-title">Streak badges</p>
          <p className="card-subtitle">Earned from your habits</p>

          {!habits.length ? (
            <div className="helper">{busy ? "Loading habits…" : "No habits yet. Create one to start earning badges."}</div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {habits.slice(0, 10).map((h) => {
                const b = streakBadge(h.streak || 0);
                return (
                  <Badge key={h.id || h.title} tone={b.tone}>
                    {b.label}: {h.title || "Habit"} ({h.streak || 0})
                  </Badge>
                );
              })}
            </div>
          )}

          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button variant="primary" onClick={() => (window.location.href = "/habits")}>Manage habits</Button>
            <Button variant="ghost" onClick={() => (window.location.href = "/analytics")}>View analytics</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
