import { useEffect, useRef } from "react";
import { Network } from "vis-network/standalone";
import { useRootCauseData } from "@/hooks/useRootCause";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/authStore";
export default function RootCausePage() {
  const { data, isLoading, error } = useRootCauseData();
  const networkRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user && user.role === "customer") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    if (!data || !networkRef.current) return;

    const nodes = data.nodes.map((node) => ({
      id: node.id,
      label: node.label,
      group: node.group,
    }));

    const edges = data.edges.map((edge) => ({
      from: edge.from,
      to: edge.to,
      label: edge.label,
      arrows: "to",
    }));

    const network = new Network(
      networkRef.current,
      { nodes, edges } as any,
      {
        height: "520px",
        nodes: {
          shape: "dot",
          size: 18,
          font: { size: 13 },
        },
        edges: {
          color: "#94a3b8",
          font: { align: "middle", size: 10 },
          smooth: true,
        },
        groups: {
          ticket: { color: { background: "#3b82f6", border: "#2563eb" } },
          release: { color: { background: "#22c55e", border: "#16a34a" } },
          component: { color: { background: "#f59e0b", border: "#d97706" } },
          incident: { color: { background: "#ef4444", border: "#dc2626" } },
        },
        physics: {
          stabilization: true,
        },
        interaction: {
          hover: true,
        },
      } as any
    );

    return () => {
      network.destroy();
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="card">Loading root cause graph...</div>
      </div>
    );
  }
    if (user?.role === "customer") {
    return null;
  }

  if (error || !data) {
    return (
      <div className="page-container">
        <div className="card">Failed to load root cause data.</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ marginBottom: 4 }}>Root Cause Insights</h1>
        <p style={{ color: "#6b7280", margin: 0 }}>
          Visualize ticket relationships across releases, components, and incidents
        </p>
      </div>

      <div
        className="grid"
        style={{ gridTemplateColumns: "2fr 1fr", alignItems: "start" }}
      >
        <div className="card">
          <h3>Relationship Graph</h3>
          <div
            ref={networkRef}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              background: "white",
              marginTop: 12,
              minHeight: 520,
            }}
          />
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          <InsightCard
            title="Releases Associated with Ticket Spikes"
            items={data.insights.release_spikes}
          />

          <InsightCard
            title="Top Fragile Components"
            items={data.insights.fragile_components}
          />

          <InsightCard
            title="Recurring Issue Clusters"
            items={data.insights.recurring_issue_clusters}
          />

          <div className="card">
            <h3 style={{ marginTop: 0 }}>Blast Radius</h3>
            <p style={{ marginBottom: 8 }}>
              <strong>{data.insights.blast_radius.label}</strong>
            </p>
            <p style={{ margin: 0, color: "#6b7280" }}>
              {data.insights.blast_radius.value} linked tickets
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightCard({
  title,
  items,
}: {
  title: string;
  items: { label: string; value: number }[];
}) {
  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {items.length === 0 ? (
        <p style={{ color: "#6b7280", margin: 0 }}>No data available.</p>
      ) : (
        <ul style={{ paddingLeft: 18, marginBottom: 0 }}>
          {items.map((item) => (
            <li key={`${item.label}-${item.value}`} style={{ marginBottom: 8 }}>
              {item.label} ({item.value})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}