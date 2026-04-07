'use client';

import { useState } from "react";
import { useRouter } from "next/router";
import { useUsers } from "@/hooks/useUsers";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AlertCircle } from "lucide-react";

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
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8 rounded-3xl border border-border bg-card p-8 shadow-lg">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-2xl font-bold text-white">
              S
            </div>
            <h1 className="text-3xl font-semibold">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your support email to continue.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Email address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="sai@example.com"
              />
            </div>

            {error ? (
              <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">{error}</p>
              </div>
            ) : null}

            <Button
              onClick={handleLogin}
              disabled={isLoading || !email.trim()}
              className="w-full"
              size="lg"
            >
              {isLoading ? "Loading..." : "Continue"}
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
            Tip: use a valid user email from the demo dataset to sign in.
          </div>
        </div>
      </div>
    </div>
  );
}
