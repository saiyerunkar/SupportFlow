import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export type RootCauseNode = {
  id: string;
  label: string;
  group: "ticket" | "release" | "component" | "incident";
};

export type RootCauseEdge = {
  from: string;
  to: string;
  label: string;
};

export type RootCauseInsights = {
  release_spikes: { label: string; value: number }[];
  fragile_components: { label: string; value: number }[];
  recurring_issue_clusters: { label: string; value: number }[];
  blast_radius: { label: string; value: number };
};

export type RootCauseResponse = {
  nodes: RootCauseNode[];
  edges: RootCauseEdge[];
  insights: RootCauseInsights;
};

export function useRootCauseData() {
  return useQuery<RootCauseResponse>({
    queryKey: ["root-cause"],
    queryFn: () => apiFetch<RootCauseResponse>("/system-data/root-cause"),
  });
}