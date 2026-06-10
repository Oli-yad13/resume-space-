import { Badge } from "./Badge";
import type { PostStatus } from "@/lib/types";

// Review-state badge used across jobs, resources and the approvals queue.
export function StatusBadge({ status }: { status: PostStatus }) {
  switch (status) {
    case "APPROVED": {
      return <Badge variant="success">Approved</Badge>;
    }
    case "REJECTED": {
      return <Badge variant="error">Rejected</Badge>;
    }
    default: {
      return <Badge variant="warning">Pending review</Badge>;
    }
  }
}
