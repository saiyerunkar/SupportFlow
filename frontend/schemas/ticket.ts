import { z } from "zod";

export type Ticket = {
  id: string;
  title: string;
  description: string;
  ticket_type: string;
  category: string;
  priority: string;
  status: string;

  customer_id: string;
  assigned_agent_id?: string | null;
  release_id?: string | null;
  sprint_id?: string | null;
  component_id?: string | null;
  incident_id?: string | null;
  related_ticket_id?: string | null;

  customer_name?: string | null;
  assigned_agent_name?: string | null;
  release_name?: string | null;
  sprint_name?: string | null;
  component_name?: string | null;
  incident_title?: string | null;

  created_at: string;
  updated_at: string;
};

export const ticketCreateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  category: z.string().min(2, "Category is required"),
  priority: z.string().min(1),
  status: z.string().min(1),
  customer_id: z.string().uuid("Select a valid customer"),
  assigned_agent_id: z.string().optional().nullable(),
  release_id: z.string().optional().nullable(),
  sprint_id: z.string().optional().nullable(),
  component_id: z.string().optional().nullable(),
  incident_id: z.string().optional().nullable(),
  related_ticket_id: z.string().optional().nullable(),
});

export type TicketCreateInput = z.infer<typeof ticketCreateSchema>;