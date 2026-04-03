import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export type DashboardAnalytics = {
  summary: {
    total_open_tickets: number;
    average_resolution_time: number;
    high_priority_tickets: number;
    resolved_tickets: number;
    blocked_tickets: number;
  };
  category_distribution: {
    label: string;
    value: number;
  }[];
  agent_workload: {
    label: string;
    value: number;
  }[];
};

export type AdminAnalytics = {
  release_ticket_counts: {
    label: string;
    value: number;
  }[];
  customer_internal_breakdown: {
    label: string;
    value: number;
  }[];
  fragility_ranking: {
    component: string;
    linked_tickets: number;
    high_priority_count: number;
    last_occurrence: string | null;
  }[];
  recurring_issue_indicator: string;
};

function buildDashboardQuery(role?: string, userId?: string) {
  const params = new URLSearchParams();
  if (role) params.append("role", role);
  if (userId) params.append("user_id", userId);

  const query = params.toString();
  return query ? `/analytics/dashboard?${query}` : "/analytics/dashboard";
}

export function useDashboardAnalytics(role?: string, userId?: string) {
  return useQuery<DashboardAnalytics>({
    queryKey: ["dashboard-analytics", role, userId],
    queryFn: () => apiFetch<DashboardAnalytics>(buildDashboardQuery(role, userId)),
  });
}

export function useAdminAnalytics() {
  return useQuery<AdminAnalytics>({
    queryKey: ["admin-analytics"],
    queryFn: () => apiFetch<AdminAnalytics>("/analytics/admin"),
  });
}