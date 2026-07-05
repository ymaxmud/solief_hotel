"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
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
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const previousActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      previousActiveElement?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-treeGreen/70 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div ref={panelRef} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-[#f7f4ed] p-5 shadow-glow md:p-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id="modal-title" className="font-display text-2xl text-charcoal md:text-3xl">{title}</h2>
          <Button ref={closeButtonRef} type="button" variant="light" onClick={onClose} aria-label={closeLabel} className="h-11 w-11 px-0">
            <X size={18} />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
