import React, { useMemo, useState } from "react";
import { Card, Button, Badge } from "../ui/primitives";
import { useAuth } from "../auth/AuthContext";
import { useToasts } from "../ui/ToastProvider";
import { ExportApi } from "../api/client";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#F472B6", "#A78BFA", "#10B981", "#EF4444", "#60A5FA", "#FBBF24"];

function sampleTrend() {
  const now = new Date();
  const pts = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    pts.push({
      day: d.toLocaleDateString(undefined, { weekday: "short" }),
      completion: Math.max(15, Math.min(95, Math.round(40 + Math.sin(i) * 18 + Math.random() * 18))),
      streak: Math.max(0, Math.round(5 + (6 - i) + Math.random() * 2)),
    });
  }
  return pts;
}

function sampleCategory() {
  return [
    { name: "Health", value: 42 },
    { name: "Learning", value: 28 },
    { name: "Mind", value: 18 },
    { name: "Work", value: 12 },
  ];
}

// PUBLIC_INTERFACE
export default function AnalyticsPage() {
  /** Analytics route: /analytics */
  const { token } = useAuth();
  const toasts = useToasts();
  const [exportBusy, setExportBusy] = useState(false);

  const trend = useMemo(() => sampleTrend(), []);
  const category = useMemo(() => sampleCategory(), []);

  const exportCsv = async () => {
    setExportBusy(true);
    try {
      await ExportApi.exportCsv({ token });
      toasts.show({ type: "success", title: "Export started", message: "CSV export triggered on backend." });
    } catch (e) {
      toasts.show({ type: "error", title: "CSV export failed", message: e?.message || "Backend export endpoint not ready yet." });
    } finally {
      setExportBusy(false);
    }
  };

  const exportPdf = async () => {
    setExportBusy(true);
    try {
      await ExportApi.exportPdf({ token });
      toasts.show({ type: "success", title: "Export started", message: "PDF export triggered on backend." });
    } catch (e) {
      toasts.show({ type: "error", title: "PDF export failed", message: e?.message || "Backend export endpoint not ready yet." });
    } finally {
      setExportBusy(false);
    }
  };

  return (
    <div className="grid">
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <p className="card-title">Analytics</p>
            <p className="card-subtitle">Trends, streaks, and category breakdown</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button variant="ghost" onClick={exportCsv} disabled={exportBusy}>Export CSV</Button>
            <Button variant="primary" onClick={exportPdf} disabled={exportBusy}>Export PDF</Button>
          </div>
        </div>
        <div className="helper">Charts use sample data until backend analytics endpoints are implemented.</div>
      </Card>

      <div className="grid grid-2">
        <Card>
          <p className="card-title">Completion trend (7d)</p>
          <p className="card-subtitle">Completion % by day</p>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="completion" stroke="#F472B6" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <p className="card-title">Streak growth (7d)</p>
          <p className="card-subtitle">Streak points by day</p>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="streak" fill="#A78BFA" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-2">
        <Card>
          <p className="card-title">Category breakdown</p>
          <p className="card-subtitle">Share of tracked habits</p>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={category} dataKey="value" nameKey="name" outerRadius={110} innerRadius={55} paddingAngle={2}>
                  {category.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Badge tone="primary">Primary</Badge>
            <Badge tone="secondary">Secondary</Badge>
            <Badge tone="success">Success</Badge>
          </div>
        </Card>

        <Card>
          <p className="card-title">Notes</p>
          <p className="card-subtitle">What’s coming from backend</p>
          <ul style={{ margin: 0, paddingLeft: 18, color: "rgba(17,24,39,0.80)", lineHeight: 1.6 }}>
            <li>Completion trends per habit (daily/weekly/monthly period keys)</li>
            <li>Streak calculations and “best streak”</li>
            <li>Category stats and completion %</li>
            <li>Exports: CSV + PDF with report metadata</li>
          </ul>
          <div className="hr" />
          <div className="helper">
            Exports call <code>/export/csv</code> and <code>/export/pdf</code>.
          </div>
        </Card>
      </div>
    </div>
  );
}
