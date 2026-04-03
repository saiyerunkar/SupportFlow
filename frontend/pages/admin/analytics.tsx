import { useRouter } from "next/router";
import { useEffect } from "react";
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

import { useAdminAnalytics } from "@/hooks/useAnalytics";
import { useAuthStore } from "@/store/authStore";

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { data, isLoading, error } = useAdminAnalytics();

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (user?.role !== "admin") {
    return null;
  }

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="card">Loading admin analytics...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page-container">
        <div className="card">Failed to load admin analytics.</div>
      </div>
    );
  }

  const releaseChartData = {
    labels: data.release_ticket_counts.map((item) => item.label),
    datasets: [
      {
        label: "Tickets",
        data: data.release_ticket_counts.map((item) => item.value),
        backgroundColor: "#2563eb",
        borderRadius: 8,
      },
    ],
  };

  const typeChartData = {
    labels: data.customer_internal_breakdown.map((item) => item.label),
    datasets: [
      {
        data: data.customer_internal_breakdown.map((item) => item.value),
        backgroundColor: ["#2563eb", "#f59e0b"],
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: 20 }}>
        <h1 className="section-title">Admin Analytics</h1>
        <p className="section-subtitle">
          Advanced insights for engineering and support leads
        </p>
      </div>

      <div
        className="grid"
        style={{ gridTemplateColumns: "2fr 1fr", alignItems: "start", marginBottom: 20 }}
      >
        <div className="card" style={{ borderTop: "4px solid #2563eb" }}>
          <h3 className="section-title">Issue Spike Detection</h3>
          <Bar
            data={releaseChartData}
            options={{
              plugins: {
                legend: { display: false },
              },
            }}
          />
        </div>

        <div className="card" style={{ borderTop: "4px solid #f59e0b" }}>
          <h3 className="section-title">Customer vs Internal</h3>
          <div style={{ maxWidth: 300 }}>
            <Doughnut data={typeChartData} />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20, borderTop: "4px solid #16a34a" }}>
        <h3 className="section-title">Fragility Ranking</h3>
        <div style={{ overflowX: "auto" }}>
          <table className="app-table">
            <thead>
              <tr>
                <th>Component</th>
                <th>Linked Tickets</th>
                <th>High Priority Count</th>
                <th>Last Occurrence</th>
              </tr>
            </thead>
            <tbody>
              {data.fragility_ranking.map((row) => (
                <tr key={row.component}>
                  <td>{row.component}</td>
                  <td>{row.linked_tickets}</td>
                  <td>
                    <span
                      style={{
                        color: row.high_priority_count > 0 ? "#dc2626" : "#111827",
                        fontWeight: row.high_priority_count > 0 ? 700 : 400,
                      }}
                    >
                      {row.high_priority_count}
                    </span>
                  </td>
                  <td>
                    {row.last_occurrence
                      ? new Date(row.last_occurrence).toLocaleDateString()
                      : "--"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ borderTop: "4px solid #7c3aed" }}>
        <h3 className="section-title">Recurring Issue Indicator</h3>
        <p
          style={{
            marginBottom: 0,
            background: "#f5f3ff",
            padding: "12px 14px",
            borderRadius: 8,
            color: "#5b21b6",
            fontWeight: 600,
          }}
        >
          {data.recurring_issue_indicator}
        </p>
      </div>
    </div>
  );
}