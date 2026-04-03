export type User = {
  id: string;
  full_name: string;
  email: string;
  role: "customer" | "agent" | "admin";
  created_at: string;
  updated_at: string;
};