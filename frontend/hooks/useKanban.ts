import { useMemo } from "react";
import { useTickets, useUpdateTicket } from "@/hooks/useTickets";
import { Ticket } from "@/schemas/ticket";

export type KanbanColumnKey = "new" | "in_progress" | "blocked" | "resolved";

export const KANBAN_COLUMNS: { key: KanbanColumnKey; title: string }[] = [
  { key: "new", title: "New" },
  { key: "in_progress", title: "In Progress" },
  { key: "blocked", title: "Blocked" },
  { key: "resolved", title: "Resolved" },
];

export function useKanbanTickets() {
  const query = useTickets();

  const grouped = useMemo(() => {
    const base: Record<KanbanColumnKey, Ticket[]> = {
      new: [],
      in_progress: [],
      blocked: [],
      resolved: [],
    };

    (query.data || []).forEach((ticket) => {
      const key = ticket.status as KanbanColumnKey;
      if (base[key]) {
        base[key].push(ticket);
      }
    });

    return base;
  }, [query.data]);

  return {
    ...query,
    grouped,
  };
}

export function useMoveTicket() {
  return useUpdateTicket();
}