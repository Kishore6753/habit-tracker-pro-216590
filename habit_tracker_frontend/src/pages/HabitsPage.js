import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Badge } from "../ui/primitives";
import { HabitsApi } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useToasts } from "../ui/ToastProvider";

const FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const DEFAULT_CATEGORIES = ["Health", "Learning", "Mind", "Work", "Home", "Social"];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function monthKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function weekKey(d = new Date()) {
  // ISO week key: YYYY-Www (simple approximation; backend can standardize)
  const dt = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = dt.getUTCDay() || 7;
  dt.setUTCDate(dt.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((dt - yearStart) / 86400000) + 1) / 7);
  return `${dt.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function periodKeyForFrequency(freq) {
  if (freq === "weekly") return weekKey();
  if (freq === "monthly") return monthKey();
  return todayISO();
}

// PUBLIC_INTERFACE
export default function HabitsPage() {
  /** Habits route: /habits */
  const { token } = useAuth();
  const toasts = useToasts();

  const [habits, setHabits] = useState([]);
  const [busy, setBusy] = useState(false);

  // Create/edit modal-ish inline editor
  const [editing, setEditing] = useState(null); // habit object or null
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [category, setCategory] = useState("Health");

  const [q, setQ] = useState("");
  const [filterFrequency, setFilterFrequency] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const categories = useMemo(() => {
    const fromHabits = habits.map((h) => h.category).filter(Boolean);
    return Array.from(new Set([...DEFAULT_CATEGORIES, ...fromHabits]));
  }, [habits]);

  const load = async () => {
    setBusy(true);
    try {
      const res = await HabitsApi.list({ token, q, frequency: filterFrequency || undefined, category: filterCategory || undefined });
      const list = Array.isArray(res?.habits) ? res.habits : Array.isArray(res) ? res : [];
      setHabits(
        list.map((h) => ({
          ...h,
          id: h.id ?? h.habitId ?? h._id ?? h.title, // fallback for stub
          title: h.title ?? h.name ?? "Untitled habit",
          description: h.description ?? "",
          frequency: h.frequency ?? "daily",
          category: h.category ?? "General",
          streak: h.streak ?? h.currentStreak ?? 0,
          completionPct: h.completionPct ?? h.completionPercentage ?? null,
          completed: Boolean(h.completed ?? h.isCompletedToday ?? h.completedToday ?? false),
        }))
      );
    } catch (e) {
      toasts.show({ type: "error", title: "Unable to load habits", message: e?.message || "Backend not available yet." });
      setHabits([]);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditing({ id: null });
    setTitle("");
    setDescription("");
    setFrequency("daily");
    setCategory(categories[0] || "Health");
  };

  const openEdit = (h) => {
    setEditing(h);
    setTitle(h.title || "");
    setDescription(h.description || "");
    setFrequency(h.frequency || "daily");
    setCategory(h.category || "General");
  };

  const closeEditor = () => {
    setEditing(null);
  };

  const saveHabit = async (e) => {
    e.preventDefault();
    try {
      const payload = { title, description, frequency, category };
      if (editing?.id) {
        await HabitsApi.update({ token, id: editing.id, patch: payload });
        toasts.show({ type: "success", title: "Habit updated", message: "Nice refinement." });
      } else {
        await HabitsApi.create({ token, habit: payload });
        toasts.show({ type: "success", title: "Habit created", message: "Let’s start that streak." });
      }
      closeEditor();
      await load();
    } catch (e2) {
      toasts.show({ type: "error", title: "Save failed", message: e2?.message || "Backend not available yet." });
    }
  };

  const deleteHabit = async (h) => {
    if (!window.confirm(`Delete habit "${h.title}"?`)) return;
    try {
      await HabitsApi.remove({ token, id: h.id });
      toasts.show({ type: "success", title: "Deleted", message: "Habit removed." });
      await load();
    } catch (e) {
      toasts.show({ type: "error", title: "Delete failed", message: e?.message || "Backend not available yet." });
    }
  };

  const toggleCompletion = async (h) => {
    const periodKey = periodKeyForFrequency(h.frequency);
    try {
      await HabitsApi.toggleCompletion({ token, id: h.id, periodKey, completed: !h.completed });
      setHabits((prev) =>
        prev.map((x) => (x.id === h.id ? { ...x, completed: !x.completed, streak: x.streak + (!x.completed ? 1 : -1) } : x))
      );
    } catch (e) {
      toasts.show({ type: "error", title: "Couldn’t update completion", message: e?.message || "Backend not available yet." });
    }
  };

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return habits.filter((h) => {
      const matchQ = !qq || (h.title || "").toLowerCase().includes(qq) || (h.description || "").toLowerCase().includes(qq);
      const matchF = !filterFrequency || h.frequency === filterFrequency;
      const matchC = !filterCategory || h.category === filterCategory;
      return matchQ && matchF && matchC;
    });
  }, [habits, q, filterFrequency, filterCategory]);

  return (
    <div className="grid">
      <Card>
        <div className="form-grid-2" style={{ alignItems: "end" }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 12, marginBottom: 6 }}>Search</div>
            <input className="input" placeholder="Search habits…" value={q} onChange={(e) => setQ(e.target.value)} />
            <div className="helper">Search title/description. Filters work even when backend is stubbed.</div>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
            <Button variant="ghost" onClick={load} disabled={busy}>{busy ? "Refreshing…" : "Refresh"}</Button>
            <Button variant="primary" onClick={openCreate}>Create habit</Button>
          </div>
        </div>

        <div className="hr" />

        <div className="form-grid-2">
          <label>
            <div style={{ fontWeight: 900, fontSize: 12, marginBottom: 6 }}>Frequency</div>
            <select className="select" value={filterFrequency} onChange={(e) => setFilterFrequency(e.target.value)}>
              <option value="">All</option>
              {FREQUENCIES.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </label>

          <label>
            <div style={{ fontWeight: 900, fontSize: 12, marginBottom: 6 }}>Category</div>
            <select className="select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      {editing ? (
        <Card>
          <h3 className="card-title">{editing.id ? "Edit habit" : "Create habit"}</h3>
          <p className="card-subtitle">Title, description, frequency and category.</p>

          <form onSubmit={saveHabit} className="form-row">
            <label>
              <div style={{ fontWeight: 900, fontSize: 12, marginBottom: 6 }}>Title</div>
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </label>

            <label>
              <div style={{ fontWeight: 900, fontSize: 12, marginBottom: 6 }}>Description</div>
              <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
            </label>

            <div className="form-grid-2">
              <label>
                <div style={{ fontWeight: 900, fontSize: 12, marginBottom: 6 }}>Frequency</div>
                <select className="select" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                  {FREQUENCIES.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </label>

              <label>
                <div style={{ fontWeight: 900, fontSize: 12, marginBottom: 6 }}>Category</div>
                <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Button variant="primary" type="submit">{editing.id ? "Save changes" : "Create habit"}</Button>
              <Button variant="ghost" type="button" onClick={closeEditor}>Cancel</Button>
            </div>
          </form>
        </Card>
      ) : null}

      <div className="grid grid-3">
        {filtered.map((h) => (
          <Card key={h.id}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "start" }}>
              <div style={{ minWidth: 0 }}>
                <p className="card-title" style={{ marginBottom: 4, wordBreak: "break-word" }}>{h.title}</p>
                <p className="card-subtitle" style={{ marginBottom: 8 }}>{h.description || "No description"}</p>
              </div>
              <Badge tone={h.completed ? "success" : "primary"}>{h.completed ? "Done" : "To do"}</Badge>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Badge tone="secondary">{h.frequency}</Badge>
              <Badge tone="primary">{h.category}</Badge>
              <Badge tone={h.streak >= 7 ? "success" : "default"}>Streak {h.streak}</Badge>
              {typeof h.completionPct === "number" ? <Badge tone="secondary">{h.completionPct}%</Badge> : null}
            </div>

            <div className="hr" />

            <div className="helper">
              Completion period key: <code>{periodKeyForFrequency(h.frequency)}</code>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
              <Button variant={h.completed ? "ghost" : "success"} onClick={() => toggleCompletion(h)}>
                {h.completed ? "Unmark" : "Mark complete"}
              </Button>
              <Button variant="ghost" onClick={() => openEdit(h)}>Edit</Button>
              <Button variant="danger" onClick={() => deleteHabit(h)}>Delete</Button>
            </div>
          </Card>
        ))}
      </div>

      {!filtered.length ? (
        <Card>
          <p className="card-title">No matching habits</p>
          <p className="card-subtitle">Try clearing filters or creating a new habit.</p>
        </Card>
      ) : null}
    </div>
  );
}
