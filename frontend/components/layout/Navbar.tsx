import Link from "next/link";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Ticket,
  Plus,
  Grid,
  GitBranch,
  BarChart3,
  Database,
  Users,
  Menu,
} from "lucide-react";

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
    <nav className="sticky top-0 z-50 border-b border-border bg-card shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-2">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
              S
            </div>
            <span className="hidden sm:inline">SupportFlow</span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            <Link href="/dashboard">
              <Button
                variant={router.pathname === "/dashboard" ? "default" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/tickets">
              <Button
                variant={router.pathname.startsWith("/tickets") ? "default" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <Ticket className="h-4 w-4" />
                Tickets
              </Button>
            </Link>
            <Link href="/tickets/new">
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Create
              </Button>
            </Link>
            {!isCustomer && (
              <Link href="/kanban">
                <Button
                  variant={router.pathname === "/kanban" ? "default" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <Grid className="h-4 w-4" />
                  Kanban
                </Button>
              </Link>
            )}
            {isAgentOrAdmin && (
              <Link href="/root-cause">
                <Button
                  variant={router.pathname === "/root-cause" ? "default" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <GitBranch className="h-4 w-4" />
                  Root Cause
                </Button>
              </Link>
            )}
            {isAdmin && (
              <>
                <Link href="/admin/analytics">
                  <Button
                    variant={router.pathname === "/admin/analytics" ? "default" : "ghost"}
                    size="sm"
                    className="gap-2"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Analytics
                  </Button>
                </Link>
                <Link href="/admin/system-data">
                  <Button
                    variant={router.pathname === "/admin/system-data" ? "default" : "ghost"}
                    size="sm"
                    className="gap-2"
                  >
                    <Database className="h-4 w-4" />
                    System
                  </Button>
                </Link>
                <Link href="/admin/users">
                  <Button
                    variant={router.pathname === "/admin/users" ? "default" : "ghost"}
                    size="sm"
                    className="gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Users
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Navigation</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/tickets">Tickets</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/tickets/new">Create Ticket</Link>
                  </DropdownMenuItem>
                  {!isCustomer && (
                    <DropdownMenuItem asChild>
                      <Link href="/kanban">Kanban</Link>
                    </DropdownMenuItem>
                  )}
                  {isAgentOrAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/root-cause">Root Cause</Link>
                    </DropdownMenuItem>
                  )}
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Admin</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/analytics">Analytics</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/system-data">System Data</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/users">Users</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <span className="hidden sm:inline text-sm font-medium">{user.full_name}</span>
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                    {user.role}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.full_name}</DropdownMenuLabel>
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  {user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
