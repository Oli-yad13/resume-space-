import { Metadata } from "next";

import ResourcesClient from "./resources-client";

export const metadata: Metadata = {
  title: "Resources",
  description: "Manage learning resources",
};

// Data is fetched client-side from /api/resource/admin/all — the API scopes
// the list by role (org admins see only their own posts).
export default function ResourcesPage() {
  return <ResourcesClient />;
}
