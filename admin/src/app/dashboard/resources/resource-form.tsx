"use client";

// Shared create/edit form for learning resources (light, odit.et style).
// Role-aware: org admins don't see the Featured control, and editing an
// already-reviewed post shows the resubmission warning.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Info } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import type { AdminResource } from "@/lib/types";

export const RESOURCE_CATEGORIES = [
  "Resume Writing",
  "Cover Letters",
  "Interview Preparation",
  "Job Search Strategies",
  "LinkedIn Optimization",
  "Career Development",
  "Networking Tips",
  "Salary Negotiation",
  "Portfolio Building",
];

const inputClass =
  "mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand focus:outline-none";

const labelClass = "block text-sm font-medium text-zinc-700";

export function ResourceForm({ resource }: { resource?: AdminResource }) {
  const router = useRouter();
  const { isSuper } = useAuth();
  const isEdit = resource !== undefined;
  const willResubmit = isEdit && !isSuper && resource.status !== "PENDING";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: resource?.title ?? "",
    description: resource?.description ?? "",
    type: resource?.type ?? ("VIDEO" as "VIDEO" | "ARTICLE"),
    category: resource?.category ?? RESOURCE_CATEGORIES[0],
    videoUrl: resource?.videoUrl ?? "",
    content: resource?.content ?? "",
    featured: resource?.featured ?? false,
    published: resource?.published ?? true,
    order: resource?.order ?? 0,
  });

  const set = (patch: Partial<typeof formData>) => setFormData((d) => ({ ...d, ...patch }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      ...formData,
      videoUrl: formData.type === "VIDEO" ? formData.videoUrl || null : null,
      content: formData.type === "ARTICLE" ? formData.content || null : null,
    };

    try {
      await (isEdit
        ? api(`/api/resource/${resource.id}`, { method: "PATCH", json: payload })
        : api("/api/resource", { method: "POST", json: payload }));
      router.push("/dashboard/resources");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save the resource.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/resources"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to resources
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-zinc-900">
          {isEdit ? "Edit resource" : "Add a resource"}
        </h1>
        {!isSuper && !isEdit && (
          <p className="mt-1 text-sm text-zinc-500">
            New resources are reviewed by the Resume Space team before they appear on the platform.
          </p>
        )}
      </div>

      {willResubmit && (
        <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Saving will resubmit this resource for review — it will be removed from the public site
            until the Resume Space team approves the changes.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-md border border-zinc-200 bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => set({ title: e.target.value })}
                className={inputClass}
                placeholder="e.g. How to write a winning resume"
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Description *</label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => set({ description: e.target.value })}
                className={inputClass}
                placeholder="Short summary shown in the resource library…"
              />
            </div>

            <div>
              <label className={labelClass}>Type *</label>
              <select
                required
                value={formData.type}
                onChange={(e) => set({ type: e.target.value as "VIDEO" | "ARTICLE" })}
                className={inputClass}
              >
                <option value="VIDEO">Video</option>
                <option value="ARTICLE">Article</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Category *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => set({ category: e.target.value })}
                className={inputClass}
              >
                {RESOURCE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {formData.type === "VIDEO" ? (
              <div className="sm:col-span-2">
                <label className={labelClass}>Video URL *</label>
                <input
                  type="url"
                  required
                  value={formData.videoUrl}
                  onChange={(e) => set({ videoUrl: e.target.value })}
                  className={inputClass}
                  placeholder="https://youtube.com/watch?v=…"
                />
              </div>
            ) : (
              <div className="sm:col-span-2">
                <label className={labelClass}>Article content *</label>
                <textarea
                  required
                  rows={10}
                  value={formData.content}
                  onChange={(e) => set({ content: e.target.value })}
                  className={inputClass}
                  placeholder="Write the article content…"
                />
              </div>
            )}

            <div>
              <label className={labelClass}>Sort order</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => set({ order: parseInt(e.target.value) || 0 })}
                className={inputClass}
              />
            </div>

            <div className="flex items-end gap-6 pb-2">
              <label className="flex items-center gap-2 text-sm text-zinc-700">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => set({ published: e.target.checked })}
                  className="h-4 w-4 rounded border-zinc-300"
                />
                Published
              </label>

              {isSuper && (
                <label className="flex items-center gap-2 text-sm text-zinc-700">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => set({ featured: e.target.checked })}
                    className="h-4 w-4 rounded border-zinc-300"
                  />
                  Featured
                </label>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <Link href="/dashboard/resources">
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading
              ? "Saving…"
              : isEdit
                ? willResubmit
                  ? "Save & resubmit for review"
                  : "Save changes"
                : isSuper
                  ? "Add resource"
                  : "Submit for review"}
          </Button>
        </div>
      </form>
    </div>
  );
}
