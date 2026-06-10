"use client";

// Dashboard for organization admins: their own posts by review status and
// any recent review notes from the Resume Space team.

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, Briefcase, Plus } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { api } from "@/lib/api";
import type { AdminJob, AdminResource } from "@/lib/types";

export function OrgDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [resources, setResources] = useState<AdminResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const [jobsData, resourcesData] = await Promise.all([
          api<AdminJob[]>("/api/job/admin/all"),
          api<AdminResource[]>("/api/resource/admin/all"),
        ]);
        setJobs(jobsData);
        setResources(resourcesData);
      } catch {
        // Errors surface on the jobs/resources pages; keep the dashboard calm.
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const posts = [
    ...jobs.map((j) => ({
      id: j.id,
      kind: "job" as const,
      title: `${j.title} — ${j.company}`,
      status: j.status,
      reviewNote: j.reviewNote,
      updatedAt: j.updatedAt,
    })),
    ...resources.map((r) => ({
      id: r.id,
      kind: "resource" as const,
      title: r.title,
      status: r.status,
      reviewNote: r.reviewNote,
      updatedAt: r.updatedAt,
    })),
  ].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const count = (status: string) => posts.filter((p) => p.status === status).length;

  const statCards = [
    { label: "Live on the platform", value: count("APPROVED") },
    { label: "Pending review", value: count("PENDING") },
    { label: "Needs changes", value: count("REJECTED") },
    { label: "Total posts", value: posts.length },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome + quick actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">
            Welcome back{user.organization ? `, ${user.organization}` : ""}
          </h2>
          <p className="text-sm text-zinc-500">
            Posts you submit are reviewed by the Resume Space team before going live.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/jobs/new">
            <Button size="sm" variant="outline" className="gap-1.5">
              <Briefcase className="h-3.5 w-3.5" />
              Post a job
            </Button>
          </Link>
          <Link href="/dashboard/resources/new">
            <Button size="sm" variant="outline" className="gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              Add a resource
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {statCards.map((s) => (
          <StatCard key={s.label} label={s.label} value={loading ? "—" : s.value} />
        ))}
      </div>

      {/* Recent posts */}
      <div className="overflow-hidden rounded-md border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-5 py-3">
          <h3 className="text-sm font-semibold text-zinc-900">Your recent posts</h3>
        </div>
        {loading ? (
          <p className="py-10 text-center text-sm text-zinc-400">Loading…</p>
        ) : posts.length === 0 ? (
          <div className="py-14 text-center">
            <Plus className="mx-auto h-10 w-10 text-zinc-200" />
            <p className="mt-3 text-sm text-zinc-400">
              Nothing posted yet — start with a job or a learning resource.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {posts.slice(0, 8).map((post) => (
              <li key={`${post.kind}-${post.id}`} className="px-5 py-3.5">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <Link
                      href={`/dashboard/${post.kind === "job" ? "jobs" : "resources"}/${post.id}/edit`}
                      className="block truncate text-sm font-medium text-zinc-900 hover:underline"
                    >
                      {post.title}
                    </Link>
                    <p className="text-xs text-zinc-400">
                      {post.kind === "job" ? "Job posting" : "Resource"} · updated{" "}
                      {new Date(post.updatedAt).toLocaleDateString()}
                    </p>
                    {post.status === "REJECTED" && post.reviewNote && (
                      <p className="mt-1 text-xs text-red-600">
                        Reviewer: {post.reviewNote}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={post.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
