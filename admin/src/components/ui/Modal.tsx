"use client";

import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="animate-slide-in relative z-10 w-full max-w-md">
        <div className="mx-4 rounded-xl border border-zinc-200 bg-white shadow-2xl">{children}</div>
      </div>
    </div>
  );
}

export function ModalHeader({ children }: { children: React.ReactNode }) {
  return <div className="border-b border-zinc-100 px-6 py-4">{children}</div>;
}

export function ModalTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold text-zinc-900">{children}</h2>;
}

export function ModalDescription({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-sm text-zinc-600">{children}</p>;
}

export function ModalContent({ children }: { children: React.ReactNode }) {
  return <div className="px-6 py-4">{children}</div>;
}

export function ModalFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 border-t border-zinc-100 px-6 py-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
