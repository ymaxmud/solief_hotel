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
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-navy/70 p-0 backdrop-blur-md sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div ref={panelRef} className="max-h-[92dvh] w-full max-w-3xl overflow-y-auto overflow-x-hidden rounded-t-2xl border border-line bg-canvas p-4 shadow-glow sm:rounded-2xl sm:p-6 md:p-8">
        <div className="mb-5 flex items-start justify-between gap-3">
          <h2 id="modal-title" className="min-w-0 font-display text-xl text-ink sm:text-2xl md:text-3xl">{title}</h2>
          <Button ref={closeButtonRef} type="button" variant="light" onClick={onClose} aria-label={closeLabel} className="h-11 w-11 shrink-0 px-0">
            <X size={18} />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
