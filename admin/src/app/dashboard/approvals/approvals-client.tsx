"use client";

// Super-admin approval queue: every PENDING job and resource posted by an
// organization, with a full-content preview and approve / reject actions.

import { useCallback, useEffect, useState } from "react";
import { Briefcase, BookOpen, Check, CheckSquare, Eye, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal";
import { ReviewModal } from "@/components/ui/ReviewModal";
import { StatCard } from "@/components/ui/StatCard";
import { api } from "@/lib/api";
import type { AdminJob, AdminResource } from "@/lib/types";

type QueueItem =
  | { kind: "job"; job: AdminJob }
  | { kind: "resource"; resource: AdminResource };

const itemId = (item: QueueItem) => (item.kind === "job" ? item.job.id : item.resource.id);
const itemTitle = (item: QueueItem) =>
  item.kind === "job" ? `${item.job.title} — ${item.job.company}` : item.resource.title;
const itemOrg = (item: QueueItem) =>
  (item.kind === "job"
    ? (item.job.organization ?? item.job.postedBy?.organization)
    : (item.resource.organization ?? item.resource.postedBy?.organization)) ?? "Unknown org";
const itemDate = (item: QueueItem) =>
  item.kind === "job" ? item.job.createdAt : item.resource.createdAt;

export function ApprovalsClient() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<QueueItem | null>(null);
  const [review, setReview] = useState<{
    item: QueueItem;
    verdict: "APPROVED" | "REJECTED";
  } | null>(null);

  const load = useCallback(async () => {
    try {
      const [jobs, resources] = await Promise.all([
        api<AdminJob[]>("/api/job/admin/all?status=PENDING"),
        api<AdminResource[]>("/api/resource/admin/all?status=PENDING"),
      ]);

      const queue: QueueItem[] = [
        ...jobs.map((job) => ({ kind: "job" as const, job })),
        ...resources.map((resource) => ({ kind: "resource" as const, resource })),
      ].sort((a, b) => itemDate(a).localeCompare(itemDate(b))); // oldest first

      setItems(queue);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load the approval queue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleReview = async (item: QueueItem, verdict: "APPROVED" | "REJECTED", note: string) => {
    const base = item.kind === "job" ? "job" : "resource";
    await api(`/api/${base}/${itemId(item)}/review`, {
      method: "PATCH",
      json: { status: verdict, ...(note ? { reviewNote: note } : {}) },
    });
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Awaiting review" value={items.length} />
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-md border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50/50">
            <tr>
              {["Post", "Organization", "Submitted", ""].map((h, i) => (
                <th
                  key={i}
                  className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-sm text-zinc-400">
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-16 text-center">
                  <CheckSquare className="mx-auto h-10 w-10 text-zinc-200" />
                  <p className="mt-3 text-sm text-zinc-400">All caught up — nothing to review</p>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={`${item.kind}-${itemId(item)}`} className="hover:bg-zinc-50/50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      {item.kind === "job" ? (
                        <Briefcase className="h-4 w-4 shrink-0 text-zinc-400" />
                      ) : (
                        <BookOpen className="h-4 w-4 shrink-0 text-zinc-400" />
                      )}
                      <div>
                        <div className="font-medium text-zinc-900">{itemTitle(item)}</div>
                        <div className="text-xs text-zinc-400">
                          {item.kind === "job" ? "Job posting" : "Resource"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-600">{itemOrg(item)}</td>
                  <td className="px-5 py-3.5 text-zinc-500">
                    {new Date(itemDate(item)).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1"
                        onClick={() => setPreview(item)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-emerald-700"
                        onClick={() => setReview({ item, verdict: "APPROVED" })}
                      >
                        <Check className="h-3.5 w-3.5" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-red-600"
                        onClick={() => setReview({ item, verdict: "REJECTED" })}
                      >
                        <X className="h-3.5 w-3.5" />
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Preview modal */}
      {preview && (
        <Modal isOpen onClose={() => setPreview(null)}>
          <ModalHeader>
            <ModalTitle>{itemTitle(preview)}</ModalTitle>
            <ModalDescription>
              {itemOrg(preview)} · submitted {new Date(itemDate(preview)).toLocaleString()}
            </ModalDescription>
          </ModalHeader>
          <ModalContent>
            <div className="max-h-96 space-y-3 overflow-y-auto text-sm text-zinc-700">
              {preview.kind === "job" ? (
                <>
                  <PreviewField label="Location">
                    {preview.job.location} ({preview.job.locationType})
                  </PreviewField>
                  <PreviewField label="Type">
                    {preview.job.employmentType.replace("_", " ")} ·{" "}
                    {preview.job.experienceLevel.replace("_", " ")} · {preview.job.category}
                  </PreviewField>
                  {(preview.job.salaryMin ?? preview.job.salaryMax) && (
                    <PreviewField label="Salary">
                      {preview.job.salaryMin ?? "—"} – {preview.job.salaryMax ?? "—"}{" "}
                      {preview.job.salaryCurrency}
                    </PreviewField>
                  )}
                  <PreviewField label="Description">
                    <p className="whitespace-pre-wrap">{preview.job.description}</p>
                  </PreviewField>
                  {preview.job.requirements && (
                    <PreviewField label="Requirements">
                      <p className="whitespace-pre-wrap">{preview.job.requirements}</p>
                    </PreviewField>
                  )}
                  {preview.job.responsibilities && (
                    <PreviewField label="Responsibilities">
                      <p className="whitespace-pre-wrap">{preview.job.responsibilities}</p>
                    </PreviewField>
                  )}
                </>
              ) : (
                <>
                  <PreviewField label="Type">
                    {preview.resource.type} · {preview.resource.category}
                  </PreviewField>
                  <PreviewField label="Description">
                    <p className="whitespace-pre-wrap">{preview.resource.description}</p>
                  </PreviewField>
                  {preview.resource.videoUrl && (
                    <PreviewField label="Video URL">
                      <a
                        href={preview.resource.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {preview.resource.videoUrl}
                      </a>
                    </PreviewField>
                  )}
                  {preview.resource.content && (
                    <PreviewField label="Content">
                      <p className="whitespace-pre-wrap">{preview.resource.content}</p>
                    </PreviewField>
                  )}
                </>
              )}
            </div>
          </ModalContent>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setPreview(null)}>
              Close
            </Button>
            <Button
              variant="outline"
              className="text-red-600"
              onClick={() => {
                setReview({ item: preview, verdict: "REJECTED" });
                setPreview(null);
              }}
            >
              Reject
            </Button>
            <Button
              onClick={() => {
                setReview({ item: preview, verdict: "APPROVED" });
                setPreview(null);
              }}
            >
              Approve
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* Review modal */}
      {review && (
        <ReviewModal
          isOpen
          verdict={review.verdict}
          title={itemTitle(review.item)}
          onClose={() => setReview(null)}
          onConfirm={(note) => handleReview(review.item, review.verdict, note)}
        />
      )}
    </div>
  );
}

function PreviewField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{label}</p>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}
