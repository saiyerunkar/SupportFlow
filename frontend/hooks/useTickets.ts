import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiPost, apiPatch } from "@/lib/api";
import { Ticket, TicketCreateInput } from "@/schemas/ticket";
import { Comment, CommentCreateInput } from "@/schemas/comment";

export type TicketFilters = {
  role?: string;
  user_id?: string;
  status_filter?: string;
  priority_filter?: string;
  type_filter?: string;
  assigned_agent_id?: string;
  search?: string;
};

function buildTicketQuery(filters?: TicketFilters) {
  if (!filters) return "/tickets/";

  const params = new URLSearchParams();

  if (filters.role) params.append("role", filters.role);
  if (filters.user_id) params.append("user_id", filters.user_id);
  if (filters.status_filter) params.append("status_filter", filters.status_filter);
  if (filters.priority_filter) params.append("priority_filter", filters.priority_filter);
  if (filters.type_filter) params.append("type_filter", filters.type_filter);
  if (filters.assigned_agent_id) params.append("assigned_agent_id", filters.assigned_agent_id);
  if (filters.search) params.append("search", filters.search);

  const query = params.toString();
  return query ? `/tickets/?${query}` : "/tickets/";
}

export function useTickets(filters?: TicketFilters) {
  return useQuery<Ticket[]>({
    queryKey: ["tickets", filters],
    queryFn: () => apiFetch<Ticket[]>(buildTicketQuery(filters)),
  });
}

export function useTicket(ticketId?: string) {
  return useQuery<Ticket>({
    queryKey: ["ticket", ticketId],
    queryFn: () => apiFetch<Ticket>(`/tickets/${ticketId}`),
    enabled: !!ticketId,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TicketCreateInput) =>
      apiPost<Ticket, TicketCreateInput>("/tickets/", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<TicketCreateInput>;
    }) => apiPatch<Ticket, Partial<TicketCreateInput>>(`/tickets/${id}`, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket", variables.id] });
    },
  });
}

export function useTicketComments(ticketId?: string) {
  return useQuery<Comment[]>({
    queryKey: ["ticket-comments", ticketId],
    queryFn: () => apiFetch<Comment[]>(`/tickets/${ticketId}/comments`),
    enabled: !!ticketId,
  });
}

export function useCreateTicketComment(ticketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CommentCreateInput) =>
      apiPost<Comment, CommentCreateInput>(`/tickets/${ticketId}/comments`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket-comments", ticketId] });
    },
  });
}