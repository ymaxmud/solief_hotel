"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { Button } from "./Button";

export function Modal({
  open,
  onClose,
  title,
  children,
  closeLabel
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  closeLabel: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-treeGreen/70 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-label={title}>
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-[#f7f4ed] p-5 shadow-glow md:p-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl text-charcoal md:text-3xl">{title}</h2>
          <Button type="button" variant="light" onClick={onClose} aria-label={closeLabel} className="h-11 w-11 px-0">
            <X size={18} />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
