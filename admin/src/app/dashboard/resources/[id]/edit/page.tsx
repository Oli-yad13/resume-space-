"use client";

import { use, useEffect, useState } from "react";

import { api } from "@/lib/api";
import type { AdminResource } from "@/lib/types";

import { ResourceForm } from "../../resource-form";

export default function EditResourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [resource, setResource] = useState<AdminResource | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // /api/resource/admin/:id loads the post in ANY review status (the public
    // endpoint 404s pending/rejected posts) and enforces ownership.
    api<AdminResource>(`/api/resource/admin/${id}`)
      .then(setResource)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load the resource.");
      });
  }, [id]);

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!resource) {
    return <p className="py-12 text-center text-sm text-zinc-400">Loading…</p>;
  }

  return <ResourceForm resource={resource} />;
}
