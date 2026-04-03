import { useMemo, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useTickets } from "@/hooks/useTickets";
import { useUsers } from "@/hooks/useUsers";

function getStatusLabel(status: string) {
  switch (status) {
    case "new":
      return "New";
    case "in_progress":
      return "In Progress";
    case "blocked":
      return "Blocked";
    case "resolved":
      return "Resolved";
    default:
      return status;
  }
}

export default function TicketsPage() {
  const user = useAuthStore((state) => state.user);
  const { data: users = [] } = useUsers();

  const isCustomer = user?.role === "customer";
  const canSeeAssignedAgentFilter = user?.role === "agent" || user?.role === "admin";

  const agentUsers = users.filter((u) => u.role === "agent" || u.role === "admin");

  // Typed values
  const [searchInput, setSearchInput] = useState("");
  const [statusInput, setStatusInput] = useState("");
  const [priorityInput, setPriorityInput] = useState("");
  const [typeInput, setTypeInput] = useState("");
  const [assignedAgentInput, setAssignedAgentInput] = useState("");

  // Applied values
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    status_filter: "",
    priority_filter: "",
    type_filter: "",
    assigned_agent_id: "",
  });

  const filters = useMemo(() => {
    return {
      role: user?.role,
      user_id: user?.id,
      search: appliedFilters.search || undefined,
      status_filter: appliedFilters.status_filter || undefined,
      priority_filter: appliedFilters.priority_filter || undefined,
      type_filter: appliedFilters.type_filter || undefined,
      assigned_agent_id: appliedFilters.assigned_agent_id || undefined,
    };
  }, [user, appliedFilters]);

  const { data, isLoading, error } = useTickets(filters);

  const pageTitle = isCustomer ? "My Tickets" : "Tickets";
  const pageSubtitle = isCustomer
    ? "View and track your submitted support tickets"
    : "View and manage all support tickets";

  const applyFilters = () => {
    setAppliedFilters({
      search: searchInput,
      status_filter: statusInput,
      priority_filter: priorityInput,
      type_filter: typeInput,
      assigned_agent_id: assignedAgentInput,
    });
  };

  const clearFilters = () => {
    setSearchInput("");
    setStatusInput("");
    setPriorityInput("");
    setTypeInput("");
    setAssignedAgentInput("");

    setAppliedFilters({
      search: "",
      status_filter: "",
      priority_filter: "",
      type_filter: "",
      assigned_agent_id: "",
    });
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="card">Loading tickets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="card">Failed to load tickets.</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <h1 className="section-title">{pageTitle}</h1>
          <p className="section-subtitle">{pageSubtitle}</p>
        </div>
        <Link href="/tickets/new">Create Ticket</Link>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div
          className="grid"
          style={{
            gridTemplateColumns: canSeeAssignedAgentFilter
              ? "2fr 1fr 1fr 1fr 1.5fr"
              : "2fr 1fr 1fr 1fr",
            gap: 12,
          }}
        >
          <div>
            <label>Search</label>
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title"
              className="app-input"
            />
          </div>

          <div>
            <label>Status</label>
            <select
              value={statusInput}
              onChange={(e) => setStatusInput(e.target.value)}
              className="app-select"
            >
              <option value="">All</option>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="blocked">Blocked</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div>
            <label>Priority</label>
            <select
              value={priorityInput}
              onChange={(e) => setPriorityInput(e.target.value)}
              className="app-select"
            >
              <option value="">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label>Type</label>
            <select
              value={typeInput}
              onChange={(e) => setTypeInput(e.target.value)}
              className="app-select"
            >
              <option value="">All</option>
              <option value="customer">Customer</option>
              <option value="internal">Internal</option>
            </select>
          </div>

          {canSeeAssignedAgentFilter && (
            <div>
              <label>Assigned Agent</label>
              <select
                value={assignedAgentInput}
                onChange={(e) => setAssignedAgentInput(e.target.value)}
                className="app-select"
              >
                <option value="">All</option>
                {agentUsers.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.full_name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <button onClick={applyFilters} className="app-button">
            Search
          </button>
          <button onClick={clearFilters} className="app-button-secondary">
            Clear
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ overflowX: "auto" }}>
          <table className="app-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Type</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((ticket) => (
                <tr key={ticket.id}>
                  <td>
                    <Link href={`/tickets/${ticket.id}`}>
                      {ticket.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td>{ticket.title}</td>
                  <td>{ticket.ticket_type}</td>
                  <td>{ticket.category}</td>
                  <td>
                    <span className={`badge badge-${ticket.priority}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td>{getStatusLabel(ticket.status)}</td>
                  <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
                </tr>
              ))}

              {data?.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: "20px", textAlign: "center" }}>
                    No tickets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}