import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/store/authStore";
import Navbar from "@/components/layout/Navbar";
import "@/styles/globals.css";

const publicRoutes = ["/login"];

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user && !publicRoutes.includes(router.pathname)) {
      router.push("/login");
    }
  }, [user, router]);

  return (
    <QueryClientProvider client={queryClient}>
      {!publicRoutes.includes(router.pathname) && <Navbar />}
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}