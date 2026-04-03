import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiPatch, apiPost } from "@/lib/api";
import { User } from "@/schemas/auth";

export type CreateUserInput = {
  full_name: string;
  email: string;
  role: "customer" | "agent" | "admin";
};

export type UpdateUserInput = {
  full_name?: string;
  email?: string;
  role?: "customer" | "agent" | "admin";
};

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () => apiFetch<User[]>("/users/"),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserInput) =>
      apiPost<User, CreateUserInput>("/users/", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateUserInput;
    }) => apiPatch<User, UpdateUserInput>(`/users/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}