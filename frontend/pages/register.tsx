'use client';

import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8 rounded-3xl border border-border bg-card p-8 shadow-lg">
          <div className="text-center">
            <h1 className="text-3xl font-semibold">Create an account</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Registration is handled through the demo login flow.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
              Registration is not yet enabled in this demo. Please use the login flow instead.
            </div>

            <Button className="w-full" onClick={() => router.push('/login')}>
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
