"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import { ArrowLeft, Calendar, Download, FileText, Mail, User } from "lucide-react";

import { api } from "@/lib/api";
import type { AdminApplication, AdminJob } from "@/lib/types";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  REVIEWED: "bg-blue-50 text-blue-700",
  SHORTLISTED: "bg-purple-50 text-purple-700",
  INTERVIEWED: "bg-indigo-50 text-indigo-700",
  OFFERED: "bg-emerald-50 text-emerald-700",
  ACCEPTED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-700",
  WITHDRAWN: "bg-zinc-100 text-zinc-500",
};

export default function ApplicationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [job, setJob] = useState<AdminJob | null>(null);
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      // Admin endpoints: load works for any review status + enforce ownership.
      const [jobData, appsData] = await Promise.all([
        api<AdminJob>(`/api/job/admin/${id}`),
        api<AdminApplication[]>(`/api/job/${id}/applications`),
      ]);
      setJob(jobData);
      setApplications(appsData);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load applications.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const updateStatus = async (applicationId: string, status: string, notes?: string) => {
    try {
      await api(`/api/job/applications/${applicationId}/status`, {
        method: "PATCH",
        json: { status, ...(notes === undefined ? {} : { notes }) },
      });
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update the application.");
    }
  };

  if (loading) {
    return <p className="py-12 text-center text-sm text-zinc-400">Loading applications…</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/jobs"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to jobs
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-zinc-900">
          {job?.title ?? "Job"} — Applications
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {job?.company} · {applications.length} application{applications.length === 1 ? "" : "s"}
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Applications */}
      <div className="space-y-4">
        {applications.length === 0 ? (
          <div className="flex h-56 items-center justify-center rounded-md border border-zinc-200 bg-white">
            <div className="text-center">
              <User className="mx-auto h-10 w-10 text-zinc-200" />
              <p className="mt-3 text-sm text-zinc-400">No applications yet</p>
            </div>
          </div>
        ) : (
          applications.map((application) => (
            <div key={application.id} className="rounded-md border border-zinc-200 bg-white p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {application.user.picture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={application.user.picture}
                      alt={application.user.name}
                      className="h-11 w-11 rounded-full"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100">
                      <User className="h-5 w-5 text-zinc-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-zinc-900">{application.user.name}</h3>
                    <div className="mt-0.5 flex items-center gap-1.5 text-sm text-zinc-500">
                      <Mail className="h-3.5 w-3.5" />
                      <a href={`mailto:${application.user.email}`} className="hover:text-zinc-900">
                        {application.user.email}
                      </a>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-sm text-zinc-500">
                      <Calendar className="h-3.5 w-3.5" />
                      Applied {new Date(application.appliedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <select
                  value={application.status}
                  onChange={(e) => void updateStatus(application.id, e.target.value)}
                  className={`rounded-md border-0 px-3 py-1.5 text-sm font-medium focus:outline-none ${STATUS_STYLES[application.status] ?? "bg-zinc-100 text-zinc-600"}`}
                >
                  <option value="PENDING">Pending</option>
                  <option value="REVIEWED">Reviewed</option>
                  <option value="SHORTLISTED">Shortlisted</option>
                  <option value="INTERVIEWED">Interviewed</option>
                  <option value="OFFERED">Offered</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="WITHDRAWN">Withdrawn</option>
                </select>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {application.resumeUrl && (
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wide text-zinc-400">
                      Resume
                    </label>
                    <a
                      href={application.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-2 text-sm text-zinc-900 hover:underline"
                    >
                      <FileText className="h-4 w-4" />
                      View resume
                      <Download className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}

                {application.coverLetter && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium uppercase tracking-wide text-zinc-400">
                      Cover letter
                    </label>
                    <div className="mt-1 whitespace-pre-wrap rounded-md border border-zinc-100 bg-zinc-50 p-4 text-sm text-zinc-700">
                      {application.coverLetter}
                    </div>
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium uppercase tracking-wide text-zinc-400">
                    Notes
                  </label>
                  <textarea
                    defaultValue={application.notes ?? ""}
                    onBlur={(e) => {
                      if (e.target.value !== (application.notes ?? "")) {
                        void updateStatus(application.id, application.status, e.target.value);
                      }
                    }}
                    placeholder="Add notes about this application…"
                    rows={2}
                    className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
