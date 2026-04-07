'use client';

import { useEffect, useRef } from "react";
import { Network } from "vis-network/standalone";
import { useRootCauseData } from "@/hooks/useRootCause";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

    return () => network.destroy();
  }, [data]);

  if (isLoading) {
    return (
      <div className="page-container">
        <Card>
          <CardContent>Loading root cause graph...</CardContent>
        </Card>
      </div>
    );
  }

  if (user?.role === "customer") {
    return null;
  }

  if (error || !data) {
    return (
      <div className="page-container">
        <Card>
          <CardContent>Failed to load root cause data.</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-container space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Root Cause Insights</h1>
        <p className="text-sm text-muted-foreground">
          Visualize ticket relationships across releases, components, and incidents.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Relationship Graph</CardTitle>
            <CardDescription>Inspect how tickets are connected to releases, components, and incidents.</CardDescription>
          </CardHeader>
          <div className="rounded-3xl border border-border bg-background p-4" style={{ minHeight: 520 }}>
            <div ref={networkRef} className="h-full w-full" />
          </div>
        </Card>

        <div className="space-y-4">
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

          <Card>
            <CardHeader>
              <CardTitle>Blast Radius</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Top release with the most linked tickets</p>
              <div className="mt-4 rounded-2xl border border-border bg-muted/50 p-4">
                <p className="text-base font-semibold">{data.insights.blast_radius.label}</p>
                <p className="text-sm text-muted-foreground">{data.insights.blast_radius.value} linked tickets</p>
              </div>
            </CardContent>
          </Card>
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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data available.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={`${item.label}-${item.value}`} className="flex items-center justify-between gap-4 text-sm">
                <span>{item.label}</span>
                <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">{item.value}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
