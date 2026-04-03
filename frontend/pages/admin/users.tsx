import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/authStore";
import { useCreateUser, useUpdateUser, useUsers } from "@/hooks/useUsers";

export default function AdminUsersPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const { data: users = [], isLoading, error } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"customer" | "agent" | "admin">("customer");

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (user?.role !== "admin") return null;

  const handleCreateUser = async () => {
    if (!fullName.trim() || !email.trim()) {
      alert("Please enter full name and email.");
      return;
    }

    try {
      await createUser.mutateAsync({
        full_name: fullName,
        email,
        role,
      });
      setFullName("");
      setEmail("");
      setRole("customer");
    } catch (err) {
      console.error(err);
      alert("Failed to create user.");
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="card">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="card">Failed to load users.</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div style={{ marginBottom: 20 }}>
        <h1 className="section-title">User & Role Management</h1>
        <p className="section-subtitle">Admin can create users and update roles</p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 className="section-title">Add New User</h3>

        <div
          className="grid"
          style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}
        >
          <div>
            <label>Full Name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="app-input"
            />
          </div>

          <div>
            <label>Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="app-input"
            />
          </div>

          <div>
            <label>Role</label>
            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value as "customer" | "agent" | "admin")
              }
              className="app-select"
            >
              <option value="customer">Customer</option>
              <option value="agent">Agent</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleCreateUser}
          className="app-button"
          disabled={createUser.isPending}
          style={{ marginTop: 16 }}
        >
          {createUser.isPending ? "Creating..." : "Create User"}
        </button>
      </div>

      <div className="card">
        <h3 className="section-title">Existing Users</h3>

        <div style={{ overflowX: "auto" }}>
          <table className="app-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Update Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((row) => (
                <UserRow
                  key={row.id}
                  id={row.id}
                  fullName={row.full_name}
                  email={row.email}
                  role={row.role}
                  onUpdate={async (newRole) => {
                    await updateUser.mutateAsync({
                      id: row.id,
                      payload: { role: newRole },
                    });
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UserRow({
  id,
  fullName,
  email,
  role,
  onUpdate,
}: {
  id: string;
  fullName: string;
  email: string;
  role: "customer" | "agent" | "admin";
  onUpdate: (newRole: "customer" | "agent" | "admin") => Promise<void>;
}) {
  const [selectedRole, setSelectedRole] = useState(role);

  return (
    <tr>
      <td>{fullName}</td>
      <td>{email}</td>
      <td>{role}</td>
      <td>
        <div style={{ display: "flex", gap: 8 }}>
          <select
            value={selectedRole}
            onChange={(e) =>
              setSelectedRole(e.target.value as "customer" | "agent" | "admin")
            }
            className="app-select"
            style={{ marginTop: 0 }}
          >
            <option value="customer">Customer</option>
            <option value="agent">Agent</option>
            <option value="admin">Admin</option>
          </select>

          <button onClick={() => onUpdate(selectedRole)} className="app-button-secondary">
            Save
          </button>
        </div>
      </td>
    </tr>
  );
}