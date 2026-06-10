import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AuthProvider } from "@/components/providers/auth-provider";
import { requireAdmin } from "@/lib/session";

export default async function DashLayout({ children }: { children: React.ReactNode }) {
  // Server-side gate: only ORG_ADMIN / SUPER_ADMIN sessions get in.
  const user = await requireAdmin();

  return (
    <AuthProvider user={user}>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthProvider>
  );
}
