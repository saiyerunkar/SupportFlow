import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  useTicket,
  useTicketComments,
  useCreateTicketComment,
  useUpdateTicket,
} from "@/hooks/useTickets";
import { useAuthStore } from "@/store/authStore";

function labelizeStatus(status: string) {
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

export default function TicketDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const ticketId = typeof id === "string" ? id : undefined;

  const user = useAuthStore((state) => state.user);
  const canEditTicket = user?.role === "agent" || user?.role === "admin";

  const { data: ticket, isLoading, error } = useTicket(ticketId);
  const { data: comments = [] } = useTicketComments(ticketId);
  const createComment = useCreateTicketComment(ticketId || "");
  const updateTicket = useUpdateTicket();

  const [commentBody, setCommentBody] = useState("");

  const submitComment = async () => {
    if (!ticketId || !commentBody.trim()) return;

    try {
      await createComment.mutateAsync({
        body: commentBody,
        is_internal: false,
      });
      setCommentBody("");
    } catch (err) {
      console.error(err);
      alert("Failed to add comment.");
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="card">Loading ticket...</div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="page-container">
        <div className="card">
          <h2>Ticket not found</h2>
          <p>Unable to load this ticket.</p>
          <Link href="/tickets">Back to tickets</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div style={{ marginBottom: 20 }}>
        <Link href="/tickets">← Back to Tickets</Link>
      </div>

      <div
        className="grid"
        style={{ gridTemplateColumns: "2fr 1fr", alignItems: "start" }}
      >
        <div style={{ display: "grid", gap: 16 }}>
          <div className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
                marginBottom: 20,
              }}
            >
              <div>
                <h1 className="section-title">{ticket.title}</h1>
                <p className="section-subtitle">Ticket ID: {ticket.id}</p>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <span className={`badge badge-${ticket.priority}`}>
                  {ticket.priority}
                </span>
                <span className="badge badge-status">
                  {labelizeStatus(ticket.status)}
                </span>
              </div>
            </div>

            {canEditTicket ? (
              <div style={{ marginTop: 16, marginBottom: 20 }}>
                <label>Status</label>
                <select
                  value={ticket.status}
                  onChange={async (e) => {
                    try {
                      await updateTicket.mutateAsync({
                        id: ticket.id,
                        payload: { status: e.target.value },
                      });
                    } catch (err) {
                      console.error(err);
                      alert("Failed to update status");
                    }
                  }}
                  className="app-select"
                >
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="blocked">Blocked</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            ) : (
              <div style={{ marginTop: 16, marginBottom: 20 }}>
                <label>Status</label>
                <div
                  style={{
                    marginTop: 6,
                    padding: "10px 12px",
                    borderRadius: 6,
                    border: "1px solid #e5e7eb",
                    background: "#f9fafb",
                  }}
                >
                  {labelizeStatus(ticket.status)}
                </div>
              </div>
            )}

            <div style={{ marginBottom: 24 }}>
              <h3 className="section-title">Description</h3>
              <p style={{ lineHeight: 1.6 }}>{ticket.description}</p>
            </div>

            <div
              className="grid"
              style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}
            >
              <Info label="Ticket Type" value={ticket.ticket_type} />
              <Info label="Category" value={ticket.category} />
              <Info label="Customer" value={ticket.customer_name || "Unknown"} />
              <Info
                label="Assigned Agent"
                value={ticket.assigned_agent_name || "Unassigned"}
              />
              <Info label="Release" value={ticket.release_name || "Not linked"} />
              <Info label="Sprint" value={ticket.sprint_name || "Not linked"} />
              <Info label="Component" value={ticket.component_name || "Not linked"} />
              <Info label="Incident" value={ticket.incident_title || "Not linked"} />
              <Info
                label="Related Ticket ID"
                value={ticket.related_ticket_id || "None"}
              />
            </div>
          </div>

          <div className="card">
            <h3 className="section-title">Comments</h3>

            <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
              {comments.length === 0 ? (
                <p className="muted" style={{ margin: 0 }}>
                  No comments yet.
                </p>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: 10,
                      padding: 12,
                      background: "#fafafa",
                    }}
                  >
                    <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>
                      {new Date(comment.created_at).toLocaleString()}
                      {comment.is_internal ? " • Internal" : ""}
                    </div>
                    <div>{comment.body}</div>
                  </div>
                ))
              )}
            </div>

            <div>
              <textarea
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                rows={4}
                placeholder="Add a comment..."
                className="app-textarea"
              />
              <button
                onClick={submitComment}
                className="app-button"
                disabled={createComment.isPending}
              >
                {createComment.isPending ? "Posting..." : "Add Comment"}
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          <div className="card">
            <h3 className="section-title">Resolution Metrics</h3>
            <Info label="Created At" value={new Date(ticket.created_at).toLocaleString()} />
            <Info label="Updated At" value={new Date(ticket.updated_at).toLocaleString()} />
          </div>

          <div className="card">
            <h3 className="section-title">Access</h3>
            <p className="muted" style={{ margin: 0 }}>
              {canEditTicket
                ? "You can update ticket workflow status and manage support actions."
                : "This ticket is view-only. You can still add comments and track updates."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>{label}</div>
      <div style={{ wordBreak: "break-word" }}>{value}</div>
    </div>
  );
}