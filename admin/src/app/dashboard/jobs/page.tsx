import { Metadata } from "next";

import { JobsClient } from "./jobs-client";

export const metadata: Metadata = {
  title: "Jobs",
  description: "Manage job postings",
};

// Data is fetched client-side from /api/job/admin/all — the API scopes the
// list by role (org admins see only their own posts).
export default function JobsPage() {
  return <JobsClient />;
}
