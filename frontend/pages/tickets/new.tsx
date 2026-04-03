import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateTicket } from "@/hooks/useTickets";
import { useUsers } from "@/hooks/useUsers";
import {
  useComponents,
  useIncidents,
  useReleases,
  useSprints,
} from "@/hooks/useSystemData";
import { TicketCreateInput, ticketCreateSchema } from "@/schemas/ticket";

export default function CreateTicketPage() {
  const router = useRouter();
  const { data: users = [] } = useUsers();
  const { data: releases = [] } = useReleases();
  const { data: sprints = [] } = useSprints();
  const { data: components = [] } = useComponents();
  const { data: incidents = [] } = useIncidents();

  const createTicket = useCreateTicket();

  const customerUsers = users.filter((u) => u.role === "customer");
  const agentUsers = users.filter((u) => u.role === "agent" || u.role === "admin");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TicketCreateInput>({
    resolver: zodResolver(ticketCreateSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      priority: "high",
      status: "new",
      customer_id: "",
      assigned_agent_id: null,
      release_id: null,
      sprint_id: null,
      component_id: null,
      incident_id: null,
      related_ticket_id: null,
    },
  });

  const onSubmit = async (values: TicketCreateInput) => {
    const payload = {
      ...values,
      assigned_agent_id: values.assigned_agent_id || null,
      release_id: values.release_id || null,
      sprint_id: values.sprint_id || null,
      component_id: values.component_id || null,
      incident_id: values.incident_id || null,
      related_ticket_id: values.related_ticket_id || null,
    };

    try {
      const created = await createTicket.mutateAsync(payload);
      router.push(`/tickets/${created.id}`);
    } catch (error) {
      console.error(error);
      alert("Failed to create ticket");
    }
  };

  return (
    <div className="page-container">
      <div className="card" style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 className="section-title">Create New Ticket</h1>
        <p className="section-subtitle" style={{ marginBottom: 24 }}>
          Submit a new support ticket into SupportFlow.
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div
            className="grid"
            style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}
          >
            <div>
              <label>Title</label>
              <input {...register("title")} className="app-input" />
              {errors.title && (
                <p style={{ color: "#dc2626", fontSize: 13 }}>{errors.title.message}</p>
              )}
            </div>

            <div>
              <label>Category</label>
              <input {...register("category")} className="app-input" />
              {errors.category && (
                <p style={{ color: "#dc2626", fontSize: 13 }}>{errors.category.message}</p>
              )}
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label>Description</label>
              <textarea
                {...register("description")}
                rows={5}
                className="app-textarea"
              />
              {errors.description && (
                <p style={{ color: "#dc2626", fontSize: 13 }}>
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label>Priority</label>
              <select {...register("priority")} className="app-select">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label>Status</label>
              <select {...register("status")} className="app-select">
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="blocked">Blocked</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div>
              <label>Customer</label>
              <select {...register("customer_id")} className="app-select">
                <option value="">Select customer</option>
                {customerUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name} ({user.email})
                  </option>
                ))}
              </select>
              {errors.customer_id && (
                <p style={{ color: "#dc2626", fontSize: 13 }}>
                  {errors.customer_id.message}
                </p>
              )}
            </div>

            <div>
              <label>Assigned Agent</label>
              <select {...register("assigned_agent_id")} className="app-select">
                <option value="">Unassigned</option>
                {agentUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name} ({user.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Release</label>
              <select {...register("release_id")} className="app-select">
                <option value="">None</option>
                {releases.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Sprint</label>
              <select {...register("sprint_id")} className="app-select">
                <option value="">None</option>
                {sprints.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Component</label>
              <select {...register("component_id")} className="app-select">
                <option value="">None</option>
                {components.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Incident</label>
              <select {...register("incident_id")} className="app-select">
                <option value="">None</option>
                {incidents.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
            <button type="submit" className="app-button" disabled={createTicket.isPending}>
              {createTicket.isPending ? "Creating..." : "Create Ticket"}
            </button>
            <button
              type="button"
              className="app-button-secondary"
              onClick={() => router.push("/tickets")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}