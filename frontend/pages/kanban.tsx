import Link from "next/link";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

import { useKanbanTickets, KANBAN_COLUMNS, KanbanColumnKey } from "@/hooks/useKanban";
import { useUpdateTicket } from "@/hooks/useTickets";
import { Ticket } from "@/schemas/ticket";

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
function formatDaysAgo(dateStr: string) {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  

  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function PriorityBadge({ priority }: { priority: string }) {
  const color =
    priority === "high"
      ? "#dc2626"
      : priority === "medium"
      ? "#d97706"
      : "#6b7280";

  return (
    <span
      style={{
        background: color,
        color: "white",
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 12,
      }}
    >
      {priority}
    </span>
  );
}

export default function KanbanPage() {
  const { grouped, data, isLoading, error } = useKanbanTickets();
  const sensors = useSensors(useSensor(PointerSensor));
  const updateTicket = useUpdateTicket();
    const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user && user.role === "customer") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    const ticketId = String(active.id);
    const newStatus = String(over.id) as KanbanColumnKey;
    const ticket = (data || []).find((t) => t.id === ticketId);

    if (!ticket || ticket.status === newStatus) return;

    try {
      await updateTicket.mutateAsync({
        id: ticketId,
        payload: { status: newStatus },
      } as never);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to move ticket.");
    }
  }

    if (user?.role === "customer") {
    return null;
  }
  if (isLoading) {
    return (
      <div className="page-container">
        <div className="card">Loading Kanban board...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="card">Failed to load Kanban board.</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ marginBottom: 4 }}>Kanban Board</h1>
        <p style={{ color: "#6b7280", margin: 0 }}>
          Drag tickets across workflow stages
        </p>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            alignItems: "start",
          }}
        >
          {KANBAN_COLUMNS.map((column) => (
            <KanbanColumn
              key={column.key}
              columnKey={column.key}
              title={column.title}
              tickets={grouped[column.key]}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}

function KanbanColumn({
  columnKey,
  title,
  tickets,
}: {
  columnKey: KanbanColumnKey;
  title: string;
  tickets: Ticket[];
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: columnKey,
  });

  return (
    <div
      ref={setNodeRef}
      className="card"
      style={{
        minHeight: 500,
        background:
            columnKey === "new"
                ? "#eef2ff"
                : columnKey === "in_progress"
                ? "#fef3c7"
                : columnKey === "blocked"
                ? "#fee2e2"
                : "#ecfdf5",
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <p style={{ color: "#6b7280", marginTop: 4 }}>{tickets.length} tickets</p>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {tickets.map((ticket) => (
          <KanbanCard key={ticket.id} ticket={ticket} />
        ))}

        {tickets.length === 0 && (
          <div
            style={{
              border: "1px dashed #cbd5e1",
              borderRadius: 10,
              padding: 16,
              color: "#6b7280",
              textAlign: "center",
              background: "white",
            }}
          >
            No tickets
          </div>
        )}
      </div>
    </div>
  );
}

function KanbanCard({ ticket }: { ticket: Ticket }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: ticket.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 14,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    cursor: "grab",
  } as const;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <strong>#{ticket.id.slice(0, 8)}</strong>
        <PriorityBadge priority={ticket.priority} />
      </div>

      <div style={{ marginTop: 8, fontWeight: 600 }}>{ticket.title}</div>

      <div style={{ marginTop: 6, fontSize: 13, color: "#6b7280" }}>
        {ticket.category}
      </div>

      <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
        {formatDaysAgo(ticket.created_at)}
      </div>

      <div style={{ marginTop: 10 }}>
        <Link href={`/tickets/${ticket.id}`}>Open</Link>
      </div>
    </div>
  );
}

function priorityColor(priority: string) {
  switch (priority) {
    case "high":
      return "#dc2626";
    case "medium":
      return "#d97706";
    default:
      return "#6b7280";
  }
}