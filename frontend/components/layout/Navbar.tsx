import Link from "next/link";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/authStore";

export default function Navbar() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.clearUser);

  if (!user) return null;

  const isCustomer = user.role === "customer";
  const isAgentOrAdmin = user.role === "agent" || user.role === "admin";
  const isAdmin = user.role === "admin";

  const handleLogout = () => {
    clearUser();
    router.push("/login");
  };

  return (
    <div
      style={{
        background: "white",
        borderBottom: "1px solid #e5e7eb",
        padding: "12px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
      }}
    >
      <strong style={{ fontSize: 18 }}>SupportFlow</strong>

      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/tickets">Tickets</Link>
        <Link href="/tickets/new">Create Ticket</Link>

        {!isCustomer && <Link href="/kanban">Kanban</Link>}
        {isAgentOrAdmin && <Link href="/root-cause">Root Cause</Link>}
        {isAdmin && <Link href="/admin/analytics">Admin</Link>}
        {isAdmin && <Link href="/admin/system-data">System Data</Link>}
        {isAdmin && <Link href="/admin/users">Users</Link>}

        <span className="muted" style={{ fontSize: 14 }}>
          {user.full_name} ({user.role})
        </span>

        <button onClick={handleLogout} className="app-button-danger">
          Logout
        </button>
      </div>
    </div>
  );
}