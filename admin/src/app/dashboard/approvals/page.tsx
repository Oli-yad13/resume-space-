import { Metadata } from "next";

import { requireSuperAdmin } from "@/lib/session";

import { ApprovalsClient } from "./approvals-client";

export const metadata: Metadata = {
  title: "Approvals",
  description: "Review pending organization posts",
};

export default async function ApprovalsPage() {
  await requireSuperAdmin();

  return <ApprovalsClient />;
}
