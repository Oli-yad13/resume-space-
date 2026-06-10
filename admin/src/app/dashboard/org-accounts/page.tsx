import { Metadata } from "next";

import { requireSuperAdmin } from "@/lib/session";

import { OrgAccountsClient } from "./org-accounts-client";

export const metadata: Metadata = {
  title: "Organization Accounts",
  description: "Manage partner organization accounts",
};

export default async function OrgAccountsPage() {
  await requireSuperAdmin();

  return <OrgAccountsClient />;
}
