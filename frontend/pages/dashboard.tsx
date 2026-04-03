import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

import { useDashboardAnalytics } from "@/hooks/useAnalytics";
import { useAuthStore } from "@/store/authStore";

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const categoryColors = [
  "#2563eb",
  "#16a34a",
  "#d97706",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#f59e0b",
  "#4b5563",
];

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const isCustomer = user?.role === "customer";

  const { data, isLoading, error } = useDashboardAnalytics(user?.role, user?.id);

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="card">Loading dashboard...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page-container">
        <div className="card">Failed to load dashboard data.</div>
      </div>
    );
  }

  const categoryChartData = {
    labels: data.category_distribution.map((item) => item.label),
    datasets: [
      {
        data: data.category_distribution.map((item) => item.value),
        backgroundColor: categoryColors,
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  const agentChartData = {
    labels: data.agent_workload.map((item) => item.label),
    datasets: [
      {
        label: "Assigned Tickets",
        data: data.agent_workload.map((item) => item.value),
        backgroundColor: ["#2563eb", "#16a34a", "#d97706", "#7c3aed"],
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: 20 }}>
        <h1 className="section-title">Dashboard</h1>
        <p className="section-subtitle">
          {isCustomer ? "Overview of your support tickets" : "Overview of support activity"}
        </p>
      </div>

      <div
        className="grid"
        style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))", marginBottom: 20 }}
      >
        <MetricCard
          title="Total Open Tickets"
          value={data.summary.total_open_tickets}
          bg="#eff6ff"
          border="#bfdbfe"
          accent="#2563eb"
        />

        {isCustomer ? (
          <>
            <MetricCard
              title="Resolved Tickets"
              value={data.summary.resolved_tickets}
              bg="#ecfdf5"
              border="#bbf7d0"
              accent="#16a34a"
            />
            <MetricCard
              title="Blocked Tickets"
              value={data.summary.blocked_tickets}
              bg="#fef2f2"
              border="#fecaca"
              accent="#dc2626"
            />
            <MetricCard
              title="High Priority Tickets"
              value={data.summary.high_priority_tickets}
              bg="#fff7ed"
              border="#fed7aa"
              accent="#d97706"
            />
          </>
        ) : (
          <>
            <MetricCard
              title="Avg Resolution Time"
              value={data.summary.average_resolution_time}
              bg="#f5f3ff"
              border="#ddd6fe"
              accent="#7c3aed"
            />
            <MetricCard
              title="Resolved Tickets"
              value={data.summary.resolved_tickets}
              bg="#ecfdf5"
              border="#bbf7d0"
              accent="#16a34a"
            />
            <MetricCard
              title="High Priority Tickets"
              value={data.summary.high_priority_tickets}
              bg="#fff7ed"
              border="#fed7aa"
              accent="#d97706"
            />
          </>
        )}
      </div>

      {isCustomer ? (
        <div className="card">
          <h3 className="section-title">Category Distribution</h3>
          <div style={{ maxWidth: 420 }}>
            <Doughnut data={categoryChartData} />
          </div>
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: "2fr 1fr", alignItems: "start" }}>
          <div className="card">
            <h3 className="section-title">Category Distribution</h3>
            <div style={{ maxWidth: 420 }}>
              <Doughnut data={categoryChartData} />
            </div>
          </div>

          <div className="card">
            <h3 className="section-title">Agent Workload</h3>
            <Bar
              data={agentChartData}
              options={{
                plugins: {
                  legend: { display: false },
                },
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  title,
  value,
  bg,
  border,
  accent,
}: {
  title: string;
  value: number;
  bg: string;
  border: string;
  accent: string;
}) {
  return (
    <div
      className="card"
      style={{
        background: bg,
        borderColor: border,
        borderLeft: `6px solid ${accent}`,
      }}
    >
      <div className="muted" style={{ fontSize: 14, marginBottom: 10 }}>
        {title}
      </div>
      <div className="metric-value">{value}</div>
    </div>
  );
}