import React, { useMemo, useState } from "react";
import { Card, Button, Badge } from "../ui/primitives";

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function startWeekday(year, monthIndex) {
  return new Date(year, monthIndex, 1).getDay(); // 0=Sun
}

function iso(d) {
  return d.toISOString().slice(0, 10);
}

function randomDots() {
  // Placeholder until backend provides completion map for calendar.
  return Math.random() > 0.65 ? 3 : Math.random() > 0.45 ? 2 : Math.random() > 0.25 ? 1 : 0;
}

// PUBLIC_INTERFACE
export default function CalendarPage() {
  /** Calendar route: /calendar */
  const [mode, setMode] = useState("monthly"); // monthly | weekly
  const [cursor, setCursor] = useState(() => new Date());

  const year = cursor.getFullYear();
  const monthIndex = cursor.getMonth();
  const monthLabel = cursor.toLocaleString(undefined, { month: "long", year: "numeric" });

  const grid = useMemo(() => {
    const days = daysInMonth(year, monthIndex);
    const start = startWeekday(year, monthIndex);
    const cells = [];
    for (let i = 0; i < start; i++) cells.push(null);
    for (let d = 1; d <= days; d++) cells.push(new Date(year, monthIndex, d));
    return cells;
  }, [year, monthIndex]);

  const prev = () => {
    const d = new Date(cursor);
    if (mode === "weekly") d.setDate(d.getDate() - 7);
    else d.setMonth(d.getMonth() - 1);
    setCursor(d);
  };

  const next = () => {
    const d = new Date(cursor);
    if (mode === "weekly") d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);
    setCursor(d);
  };

  const weekStrip = useMemo(() => {
    const d = new Date(cursor);
    const day = d.getDay();
    const start = new Date(d);
    start.setDate(d.getDate() - day);
    return Array.from({ length: 7 }).map((_, i) => {
      const x = new Date(start);
      x.setDate(start.getDate() + i);
      return x;
    });
  }, [cursor]);

  return (
    <div className="grid">
      <Card>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p className="card-title">Calendar</p>
            <p className="card-subtitle">Monthly / weekly view of habit completion</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button variant="ghost" onClick={prev}>Prev</Button>
            <Button variant="ghost" onClick={next}>Next</Button>
            <Button variant={mode === "weekly" ? "primary" : "ghost"} onClick={() => setMode("weekly")}>Weekly</Button>
            <Button variant={mode === "monthly" ? "primary" : "ghost"} onClick={() => setMode("monthly")}>Monthly</Button>
          </div>
        </div>
      </Card>

      {mode === "monthly" ? (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <p className="card-title" style={{ margin: 0 }}>{monthLabel}</p>
            <Badge tone="secondary">Dots are placeholders until backend provides completion map</Badge>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 8, marginTop: 10 }}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} style={{ fontSize: 12, fontWeight: 900, color: "rgba(17,24,39,0.65)" }}>{d}</div>
            ))}
            {grid.map((d, idx) => {
              if (!d) return <div key={`blank_${idx}`} style={{ height: 74 }} />;
              const dots = randomDots();
              return (
                <div
                  key={iso(d)}
                  style={{
                    border: "1px solid rgba(17,24,39,0.10)",
                    borderRadius: 16,
                    padding: 10,
                    height: 74,
                    background: "rgba(255,255,255,0.85)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 900 }}>
                    <span>{d.getDate()}</span>
                    <span style={{ color: "var(--cp-muted)" }}>{dots ? `${dots}•` : ""}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                    {Array.from({ length: dots }).map((_, i) => (
                      <span
                        key={i}
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 999,
                          background: i === 0 ? "var(--cp-primary)" : i === 1 ? "var(--cp-secondary)" : "var(--cp-success)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <p className="card-title" style={{ margin: 0 }}>Week view</p>
            <Badge tone="secondary">Backend will provide per-day completion data</Badge>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 10, marginTop: 10 }}>
            {weekStrip.map((d) => {
              const dots = randomDots();
              return (
                <div key={iso(d)} className="card" style={{ padding: 12 }}>
                  <div style={{ fontWeight: 950, fontSize: 13 }}>{d.toLocaleDateString(undefined, { weekday: "short" })}</div>
                  <div className="helper">{iso(d)}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                    {Array.from({ length: dots }).map((_, i) => (
                      <span
                        key={i}
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 999,
                          background: i === 0 ? "var(--cp-primary)" : i === 1 ? "var(--cp-secondary)" : "var(--cp-success)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
