"use client";

import { use, useEffect, useState } from "react";

import { api } from "@/lib/api";
import type { AdminJob } from "@/lib/types";

import { JobForm } from "../../job-form";

export default function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [job, setJob] = useState<AdminJob | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // /api/job/admin/:id loads the post in ANY review status (the public
    // endpoint 404s pending/rejected posts) and enforces ownership.
    api<AdminJob>(`/api/job/admin/${id}`)
      .then(setJob)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load the job.");
      });
  }, [id]);

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!job) {
    return <p className="py-12 text-center text-sm text-zinc-400">Loading…</p>;
  }

  return <JobForm job={job} />;
}
