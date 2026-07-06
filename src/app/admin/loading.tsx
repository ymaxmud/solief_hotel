export default function AdminLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3 text-charcoal/60">
        <span
          className="h-8 w-8 animate-spin rounded-full border-2 border-charcoal/20 border-t-coralBase"
          aria-hidden
        />
        <span className="text-sm">Loading…</span>
      </div>
    </div>
  );
}
