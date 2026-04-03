import { useState } from "react";
import { useRouter } from "next/router";
import { useUsers } from "@/hooks/useUsers";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const { data: users = [], isLoading } = useUsers();
  const setUser = useAuthStore((state) => state.setUser);

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const matchedUser = users.find(
      (user) => user.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!matchedUser) {
      setError("No user found with that email.");
      return;
    }

    setUser({
      id: matchedUser.id,
      full_name: matchedUser.full_name,
      email: matchedUser.email,
      role: matchedUser.role,
    });

    router.push("/dashboard");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: 420,
          padding: 28,
        }}
      >
        <h1 className="section-title">SupportFlow Login</h1>
        <p className="section-subtitle" style={{ marginBottom: 24 }}>
          Enter your email to continue
        </p>

        <div style={{ marginBottom: 16 }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            placeholder="sai@example.com"
            className="app-input"
          />
        </div>

        {error && (
          <p style={{ color: "#dc2626", fontSize: 14, marginBottom: 12 }}>
            {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="app-button"
          style={{ width: "100%" }}
        >
          {isLoading ? "Loading users..." : "Login"}
        </button>

        <div style={{ marginTop: 20, fontSize: 13, color: "#6b7280" }}>
          Sample users:
          <ul>
            <li>sai@example.com</li>
            <li>shreyas@example.com</li>
            <li>priya@example.com</li>
          </ul>
        </div>
      </div>
    </div>
  );
}