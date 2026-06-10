"use client";

// Shared create/edit form for job postings (light, odit.et style).
// Role-aware: org admins don't see the Featured control, and editing an
// already-reviewed post shows the resubmission warning.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Info } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import type { AdminJob } from "@/lib/types";

const inputClass =
  "mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand focus:outline-none";

const sectionClass = "rounded-md border border-zinc-200 bg-white p-6";

const labelClass = "block text-sm font-medium text-zinc-700";

export function JobForm({ job }: { job?: AdminJob }) {
  const router = useRouter();
  const { isSuper } = useAuth();
  const isEdit = job !== undefined;
  const willResubmit = isEdit && !isSuper && job.status !== "PENDING";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: job?.title ?? "",
    company: job?.company ?? "",
    companyLogo: job?.companyLogo ?? "",
    location: job?.location ?? "",
    locationType: job?.locationType ?? "ONSITE",
    employmentType: job?.employmentType ?? "FULL_TIME",
    description: job?.description ?? "",
    requirements: job?.requirements ?? "",
    responsibilities: job?.responsibilities ?? "",
    salaryMin: job?.salaryMin?.toString() ?? "",
    salaryMax: job?.salaryMax?.toString() ?? "",
    salaryCurrency: job?.salaryCurrency ?? "ETB",
    category: job?.category ?? "",
    tags: job?.tags.join(", ") ?? "",
    experienceLevel: job?.experienceLevel ?? "MID_LEVEL",
    featured: job?.featured ?? false,
    published: job?.published ?? true,
    expiresAt: job?.expiresAt ? job.expiresAt.slice(0, 16) : "",
  });

  const set = (patch: Partial<typeof formData>) => setFormData((d) => ({ ...d, ...patch }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      ...formData,
      companyLogo: formData.companyLogo || null,
      requirements: formData.requirements || null,
      responsibilities: formData.responsibilities || null,
      salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
      salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
      tags: formData.tags
        ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
    };

    try {
      await (isEdit
        ? api(`/api/job/${job.id}`, { method: "PATCH", json: payload })
        : api("/api/job", { method: "POST", json: payload }));
      router.push("/dashboard/jobs");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save the job.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/jobs"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to jobs
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-zinc-900">
          {isEdit ? "Edit job" : "Post a job"}
        </h1>
        {!isSuper && !isEdit && (
          <p className="mt-1 text-sm text-zinc-500">
            New posts are reviewed by the Resume Space team before they appear on the platform.
          </p>
        )}
      </div>

      {willResubmit && (
        <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Saving will resubmit this post for review — it will be removed from the public site
            until the Resume Space team approves the changes.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic information */}
        <div className={sectionClass}>
          <h2 className="mb-4 text-base font-semibold text-zinc-900">Basic information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Job title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => set({ title: e.target.value })}
                className={inputClass}
                placeholder="e.g. Senior Software Engineer"
              />
            </div>

            <div>
              <label className={labelClass}>Company *</label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => set({ company: e.target.value })}
                className={inputClass}
                placeholder="e.g. Gebeya Inc"
              />
            </div>

            <div>
              <label className={labelClass}>Company logo URL</label>
              <input
                type="url"
                value={formData.companyLogo}
                onChange={(e) => set({ companyLogo: e.target.value })}
                className={inputClass}
                placeholder="https://…"
              />
            </div>

            <div>
              <label className={labelClass}>Location *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => set({ location: e.target.value })}
                className={inputClass}
                placeholder="e.g. Addis Ababa"
              />
            </div>

            <div>
              <label className={labelClass}>Location type *</label>
              <select
                required
                value={formData.locationType}
                onChange={(e) => set({ locationType: e.target.value as typeof formData.locationType })}
                className={inputClass}
              >
                <option value="ONSITE">Onsite</option>
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Employment type *</label>
              <select
                required
                value={formData.employmentType}
                onChange={(e) =>
                  set({ employmentType: e.target.value as typeof formData.employmentType })
                }
                className={inputClass}
              >
                <option value="FULL_TIME">Full time</option>
                <option value="PART_TIME">Part time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="FREELANCE">Freelance</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Experience level *</label>
              <select
                required
                value={formData.experienceLevel}
                onChange={(e) =>
                  set({ experienceLevel: e.target.value as typeof formData.experienceLevel })
                }
                className={inputClass}
              >
                <option value="ENTRY">Entry level</option>
                <option value="JUNIOR">Junior</option>
                <option value="MID_LEVEL">Mid level</option>
                <option value="SENIOR">Senior</option>
                <option value="LEAD">Lead</option>
                <option value="EXECUTIVE">Executive</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Category *</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => set({ category: e.target.value })}
                className={inputClass}
                placeholder="e.g. Software Engineering"
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => set({ tags: e.target.value })}
                className={inputClass}
                placeholder="e.g. React, Node.js, TypeScript"
              />
            </div>
          </div>
        </div>

        {/* Salary */}
        <div className={sectionClass}>
          <h2 className="mb-4 text-base font-semibold text-zinc-900">Salary</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Minimum</label>
              <input
                type="number"
                value={formData.salaryMin}
                onChange={(e) => set({ salaryMin: e.target.value })}
                className={inputClass}
                placeholder="e.g. 30000"
              />
            </div>
            <div>
              <label className={labelClass}>Maximum</label>
              <input
                type="number"
                value={formData.salaryMax}
                onChange={(e) => set({ salaryMax: e.target.value })}
                className={inputClass}
                placeholder="e.g. 60000"
              />
            </div>
            <div>
              <label className={labelClass}>Currency</label>
              <select
                value={formData.salaryCurrency}
                onChange={(e) => set({ salaryCurrency: e.target.value })}
                className={inputClass}
              >
                <option value="ETB">ETB</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className={sectionClass}>
          <h2 className="mb-4 text-base font-semibold text-zinc-900">Details</h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Description * (minimum 50 characters)</label>
              <textarea
                required
                rows={6}
                value={formData.description}
                onChange={(e) => set({ description: e.target.value })}
                className={inputClass}
                placeholder="What the role is about…"
              />
            </div>
            <div>
              <label className={labelClass}>Requirements</label>
              <textarea
                rows={4}
                value={formData.requirements}
                onChange={(e) => set({ requirements: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Responsibilities</label>
              <textarea
                rows={4}
                value={formData.responsibilities}
                onChange={(e) => set({ responsibilities: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className={sectionClass}>
          <h2 className="mb-4 text-base font-semibold text-zinc-900">Settings</h2>
          <div className="space-y-4">
            <div className="sm:w-72">
              <label className={labelClass}>Expires at (optional)</label>
              <input
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) => set({ expiresAt: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="flex items-center gap-6">
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
          <Link href="/dashboard/jobs">
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
                  ? "Post job"
                  : "Submit for review"}
          </Button>
        </div>
      </form>
    </div>
  );
}
