"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  BookOpen,
  Check,
  Edit,
  Eye,
  FileText,
  Plus,
  Search,
  Star,
  Trash2,
  Video,
  X,
} from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ReviewModal } from "@/components/ui/ReviewModal";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { api } from "@/lib/api";
import type { AdminResource, PostStatus } from "@/lib/types";

export default function ResourcesClient() {
  const { isSuper } = useAuth();
  const [resources, setResources] = useState<AdminResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | PostStatus>("all");
  const [review, setReview] = useState<{
    resource: AdminResource;
    verdict: "APPROVED" | "REJECTED";
  } | null>(null);

  const load = useCallback(async () => {
    try {
      setResources(await api<AdminResource[]>("/api/resource/admin/all"));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load resources.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = resources.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      r.title.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      (r.organization ?? "").toLowerCase().includes(q);
    const matchesStatus = filterStatus === "all" ? true : r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: resources.length,
    pending: resources.filter((r) => r.status === "PENDING").length,
    videos: resources.filter((r) => r.type === "VIDEO").length,
    articles: resources.filter((r) => r.type === "ARTICLE").length,
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this resource? This cannot be undone.")) return;
    try {
      await api(`/api/resource/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete resource.");
    }
  };

  const handleTogglePublish = async (resource: AdminResource) => {
    try {
      await api(`/api/resource/${resource.id}/toggle-publish`, {
        method: "PATCH",
        json: { published: !resource.published },
      });
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update resource.");
    }
  };

  const handleToggleFeatured = async (resource: AdminResource) => {
    try {
      await api(`/api/resource/${resource.id}/toggle-featured`, {
        method: "PATCH",
        json: { featured: !resource.featured },
      });
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update resource.");
    }
  };

  const handleReview = async (id: string, verdict: "APPROVED" | "REJECTED", note: string) => {
    await api(`/api/resource/${id}/review`, {
      method: "PATCH",
      json: { status: verdict, ...(note ? { reviewNote: note } : {}) },
    });
    await load();
  };

  const statCards = [
    { label: "Total", value: stats.total },
    { label: "Pending review", value: stats.pending },
    { label: "Videos", value: stats.videos },
    { label: "Articles", value: stats.articles },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-4 gap-4">
          {statCards.map((s) => (
            <StatCard key={s.label} label={s.label} value={s.value} />
          ))}
        </div>
        <Link href="/dashboard/resources/new">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add resource
          </Button>
        </Link>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by title, category…"
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

      <div className="overflow-hidden rounded-md border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50/50">
              <tr>
                {["Resource", "Type", isSuper ? "Posted by" : "Category", "Views", "Status", ""].map(
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
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <BookOpen className="mx-auto h-10 w-10 text-zinc-200" />
                    <p className="mt-3 text-sm text-zinc-400">No resources found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((resource) => (
                  <tr key={resource.id} className="hover:bg-zinc-50/50">
                    <td className="max-w-md px-5 py-3.5">
                      <div className="font-medium text-zinc-900">{resource.title}</div>
                      <div className="mt-0.5 line-clamp-1 text-xs text-zinc-500">
                        {resource.description}
                      </div>
                      {resource.reviewNote && resource.status === "REJECTED" && (
                        <p className="mt-1 text-xs text-red-600">
                          Review note: {resource.reviewNote}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1.5 text-zinc-600">
                        {resource.type === "VIDEO" ? (
                          <Video className="h-3.5 w-3.5" />
                        ) : (
                          <FileText className="h-3.5 w-3.5" />
                        )}
                        {resource.type === "VIDEO" ? "Video" : "Article"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-600">
                      {isSuper ? (
                        <div>
                          {resource.organization ??
                            resource.postedBy?.organization ??
                            "Resume Space"}
                          <div className="text-xs text-zinc-400">{resource.category}</div>
                        </div>
                      ) : (
                        resource.category
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-500">{resource.views}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <StatusBadge status={resource.status} />
                        {!resource.published && <Badge>Unpublished</Badge>}
                        {resource.featured && <Badge variant="info">Featured</Badge>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        {isSuper && resource.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 text-emerald-700"
                              onClick={() => setReview({ resource, verdict: "APPROVED" })}
                            >
                              <Check className="h-3.5 w-3.5" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 text-red-600"
                              onClick={() => setReview({ resource, verdict: "REJECTED" })}
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
                            title={resource.featured ? "Unfeature" : "Feature"}
                            onClick={() => void handleToggleFeatured(resource)}
                          >
                            <Star
                              className={`h-4 w-4 ${resource.featured ? "fill-blue-500 text-blue-500" : ""}`}
                            />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          title={resource.published ? "Unpublish" : "Publish"}
                          onClick={() => void handleTogglePublish(resource)}
                        >
                          <Eye
                            className={`h-4 w-4 ${resource.published ? "" : "text-zinc-300"}`}
                          />
                        </Button>
                        <Link href={`/dashboard/resources/${resource.id}/edit`}>
                          <Button size="sm" variant="ghost" title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          title="Delete"
                          className="text-red-600"
                          onClick={() => void handleDelete(resource.id)}
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
        Showing {filtered.length} of {resources.length} resources
      </p>

      {review && (
        <ReviewModal
          isOpen
          verdict={review.verdict}
          title={review.resource.title}
          onClose={() => setReview(null)}
          onConfirm={(note) => handleReview(review.resource.id, review.verdict, note)}
        />
      )}
    </div>
  );
}
