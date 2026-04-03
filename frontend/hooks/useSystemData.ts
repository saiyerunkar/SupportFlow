import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiPost } from "@/lib/api";

export type ReleaseItem = {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type SprintItem = {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
};

export type ComponentItem = {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type IncidentItem = {
  id: string;
  title: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
};

export function useReleases() {
  return useQuery<ReleaseItem[]>({
    queryKey: ["system-data", "releases"],
    queryFn: () => apiFetch<ReleaseItem[]>("/system-data/releases"),
  });
}

export function useSprints() {
  return useQuery<SprintItem[]>({
    queryKey: ["system-data", "sprints"],
    queryFn: () => apiFetch<SprintItem[]>("/system-data/sprints"),
  });
}

export function useComponents() {
  return useQuery<ComponentItem[]>({
    queryKey: ["system-data", "components"],
    queryFn: () => apiFetch<ComponentItem[]>("/system-data/components"),
  });
}

export function useIncidents() {
  return useQuery<IncidentItem[]>({
    queryKey: ["system-data", "incidents"],
    queryFn: () => apiFetch<IncidentItem[]>("/system-data/incidents"),
  });
}

export function useCreateRelease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { name: string; description?: string | null }) =>
      apiPost<ReleaseItem, { name: string; description?: string | null }>(
        "/system-data/releases",
        payload
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-data", "releases"] });
    },
  });
}

export function useCreateSprint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { name: string }) =>
      apiPost<SprintItem, { name: string }>("/system-data/sprints", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-data", "sprints"] });
    },
  });
}

export function useCreateComponent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { name: string; description?: string | null }) =>
      apiPost<ComponentItem, { name: string; description?: string | null }>(
        "/system-data/components",
        payload
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-data", "components"] });
    },
  });
}

export function useCreateIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { title: string; description?: string | null }) =>
      apiPost<IncidentItem, { title: string; description?: string | null }>(
        "/system-data/incidents",
        payload
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-data", "incidents"] });
    },
  });
}