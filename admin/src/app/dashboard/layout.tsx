"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { isAuthenticated } from "@/lib/auth";

export default function DashLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      router.push("/");
    }
  }, [router]);

  return <DashboardLayout>{children}</DashboardLayout>;
}
