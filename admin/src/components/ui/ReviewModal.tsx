"use client";

// Approve / reject dialog with an optional note that is sent back to the
// posting organization. Used by the jobs, resources and approvals pages.

import { useState } from "react";

import { Button } from "./Button";
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from "./Modal";

type ReviewModalProps = {
  isOpen: boolean;
  verdict: "APPROVED" | "REJECTED";
  title: string;
  onClose: () => void;
  onConfirm: (reviewNote: string) => Promise<void> | void;
};

export function ReviewModal({ isOpen, verdict, title, onClose, onConfirm }: ReviewModalProps) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const isApprove = verdict === "APPROVED";

  const confirm = async () => {
    setBusy(true);
    try {
      await onConfirm(note.trim());
      setNote("");
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>{isApprove ? "Approve post" : "Reject post"}</ModalTitle>
        <ModalDescription>{title}</ModalDescription>
      </ModalHeader>
      <ModalContent>
        <label className="text-sm font-medium text-zinc-700">
          Note to the organization {isApprove ? "(optional)" : ""}
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder={
            isApprove ? "Looks good…" : "Explain what needs to change before resubmitting…"
          }
          className="mt-1.5 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand focus:outline-none"
        />
      </ModalContent>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button variant={isApprove ? "primary" : "error"} onClick={() => void confirm()} disabled={busy}>
          {busy ? "Saving…" : isApprove ? "Approve" : "Reject"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
