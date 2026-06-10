"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Briefcase,
  Check,
  Edit,
  Eye,
  MapPin,
  Plus,
  Search,
  Star,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ReviewModal } from "@/components/ui/ReviewModal";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { api } from "@/lib/api";
import type { AdminJob, PostStatus } from "@/lib/types";

export function JobsClient() {
  const { isSuper } = useAuth();
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | PostStatus>("all");
  const [review, setReview] = useState<{ job: AdminJob; verdict: "APPROVED" | "REJECTED" } | null>(
    null,
  );

  const load = useCallback(async () => {
    try {
      setJobs(await api<AdminJob[]>("/api/job/admin/all"));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredJobs = jobs.filter((job) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      job.category.toLowerCase().includes(q) ||
      (job.organization ?? "").toLowerCase().includes(q);
    const matchesStatus = filterStatus === "all" ? true : job.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: jobs.length,
    pending: jobs.filter((j) => j.status === "PENDING").length,
    approved: jobs.filter((j) => j.status === "APPROVED").length,
    applications: jobs.reduce((sum, j) => sum + (j._count?.applications ?? 0), 0),
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this job posting? This cannot be undone.")) return;
    try {
      await api(`/api/job/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete job.");
    }
  };

  const handleTogglePublish = async (id: string) => {
    try {
      await api(`/api/job/${id}/toggle-publish`, { method: "PATCH" });
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update job.");
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      await api(`/api/job/${id}/toggle-featured`, { method: "PATCH" });
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update job.");
    }
  };

  const handleReview = async (jobId: string, verdict: "APPROVED" | "REJECTED", note: string) => {
    await api(`/api/job/${jobId}/review`, {
      method: "PATCH",
      json: { status: verdict, ...(note ? { reviewNote: note } : {}) },
    });
    await load();
  };

  const statCards = [
    { label: "Total", value: stats.total },
    { label: "Pending review", value: stats.pending },
    { label: "Approved", value: stats.approved },
    { label: "Applications", value: stats.applications },
  ];

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-4 gap-4">
          {statCards.map((s) => (
            <StatCard key={s.label} label={s.label} value={s.value} />
          ))}
        </div>
        <Link href="/dashboard/jobs/new">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Post a job
          </Button>
        </Link>
      </div>

      {/* Search + filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by title, company, category…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-md border border-zinc-200 bg-white pl-9 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand focus:outline-none"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as "all" | PostStatus)}
          className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:border-brand focus:outline-none"
        >
          <option value="all">All statuses</option>
          <option value="PENDING">Pending review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-md border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50/50">
              <tr>
                {["Job", isSuper ? "Posted by" : "Location", "Type", "Stats", "Status", ""].map(
                  (h, i) => (
                    <th
                      key={i}
                      className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-zinc-400">
                    Loading…
                  </td>
                </tr>
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Briefcase className="mx-auto h-10 w-10 text-zinc-200" />
                    <p className="mt-3 text-sm text-zinc-400">No jobs found</p>
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-zinc-50/50">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-zinc-900">{job.title}</div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500">
                        <span>{job.company}</span>
                        <span>·</span>
                        <span>{job.category}</span>
                      </div>
                      {job.reviewNote && job.status === "REJECTED" && (
                        <p className="mt-1 max-w-md text-xs text-red-600">
                          Review note: {job.reviewNote}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {isSuper ? (
                        <div className="text-sm text-zinc-700">
                          {job.organization ?? job.postedBy?.organization ?? "Resume Space"}
                          <div className="text-xs text-zinc-400">
                            {job.postedBy?.name ?? "—"}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-zinc-600">
                          <MapPin className="h-3.5 w-3.5" />
                          {job.location}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600">
                      {job.employmentType.replace("_", " ")}
                      <div className="text-xs text-zinc-400">
                        {job.experienceLevel.replace("_", " ")}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3 text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          {job.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {job._count?.applications ?? 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <StatusBadge status={job.status} />
                        {!job.published && <Badge>Unpublished</Badge>}
                        {job.featured && <Badge variant="info">Featured</Badge>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        {isSuper && job.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 text-emerald-700"
                              onClick={() => setReview({ job, verdict: "APPROVED" })}
                            >
                              <Check className="h-3.5 w-3.5" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 text-red-600"
                              onClick={() => setReview({ job, verdict: "REJECTED" })}
                            >
                              <X className="h-3.5 w-3.5" />
                              Reject
                            </Button>
                          </>
                        )}
                        {isSuper && (
                          <Button
                            size="sm"
                            variant="ghost"
                            title={job.featured ? "Unfeature" : "Feature"}
                            onClick={() => void handleToggleFeatured(job.id)}
                          >
                            <Star
                              className={`h-4 w-4 ${job.featured ? "fill-blue-500 text-blue-500" : ""}`}
                            />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          title={job.published ? "Unpublish" : "Publish"}
                          onClick={() => void handleTogglePublish(job.id)}
                        >
                          {job.published ? <Eye className="h-4 w-4" /> : <Eye className="h-4 w-4 text-zinc-300" />}
                        </Button>
                        <Link href={`/dashboard/jobs/${job.id}/applications`}>
                          <Button size="sm" variant="ghost" title="Applications">
                            <Users className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/jobs/${job.id}/edit`}>
                          <Button size="sm" variant="ghost" title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          title="Delete"
                          className="text-red-600"
                          onClick={() => void handleDelete(job.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-center text-xs text-zinc-400">
        Showing {filteredJobs.length} of {jobs.length} jobs
      </p>

      {review && (
        <ReviewModal
          isOpen
          verdict={review.verdict}
          title={`${review.job.title} — ${review.job.company}`}
          onClose={() => setReview(null)}
          onConfirm={(note) => handleReview(review.job.id, review.verdict, note)}
        />
      )}
    </div>
  );
}
