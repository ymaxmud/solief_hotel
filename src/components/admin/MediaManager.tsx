"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type HotelImageRow = {
  id: string;
  url: string;
  storage_path: string;
  room_category_id: string | null;
  in_gallery: boolean;
  alt_en: string | null;
};

export type MediaLabels = {
  upload: string;
  uploading: string;
  uploaded: string;
  uploadFailed: string;
  remove: string;
  removeConfirm: string;
  removed: string;
  removeFailed: string;
  category: string;
  gallery: string;
  altText: string;
  none: string;
  noImages: string;
  fileHint: string;
};

/**
 * Upload and remove public hotel photography.
 *
 * The browser never talks to Supabase Storage directly — every upload and
 * delete goes through /api/admin/media, which re-checks the staff role and
 * validates the file server-side.
 */
export function MediaManager({
  images,
  categories,
  labels,
  canManage
}: {
  images: HotelImageRow[];
  categories: Array<{ id: string; label: string }>;
  labels: MediaLabels;
  canManage: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formEl = event.currentTarget;
    setBusy(true);
    setMessage("");
    setIsError(false);
    try {
      const response = await fetch("/api/admin/media", { method: "POST", body: new FormData(formEl) });
      const json = await response.json().catch(() => ({}));
      if (!response.ok || !json.ok) {
        setIsError(true);
        setMessage(json.error || labels.uploadFailed);
        return;
      }
      setMessage(labels.uploaded);
      formEl.reset();
      router.refresh();
    } catch {
      setIsError(true);
      setMessage(labels.uploadFailed);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm(labels.removeConfirm)) return;
    setBusy(true);
    setMessage("");
    setIsError(false);
    try {
      const response = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok || !json.ok) {
        setIsError(true);
        setMessage(json.error || labels.removeFailed);
        return;
      }
      setMessage(labels.removed);
      router.refresh();
    } catch {
      setIsError(true);
      setMessage(labels.removeFailed);
    } finally {
      setBusy(false);
    }
  }

  const inputClass = "focus-ring min-h-10 w-full rounded-md border border-charcoal/15 bg-white px-2 text-sm";

  return (
    <div className="grid gap-5">
      {canManage ? (
        <form onSubmit={upload} className="grid gap-3 rounded-lg border border-charcoal/10 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-1">
              <label htmlFor="media-file" className="text-xs font-semibold text-greenGray">
                {labels.upload}
              </label>
              <input
                id="media-file"
                name="file"
                type="file"
                required
                accept="image/jpeg,image/png,image/webp"
                aria-describedby="media-file-hint"
                className={inputClass}
              />
              <p id="media-file-hint" className="text-[11px] text-charcoal/55">
                {labels.fileHint}
              </p>
            </div>
            <div className="grid gap-1">
              <label htmlFor="media-category" className="text-xs font-semibold text-greenGray">
                {labels.category}
              </label>
              <select id="media-category" name="roomCategoryId" className={inputClass} defaultValue="">
                <option value="">{labels.none}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1">
              <label htmlFor="media-alt" className="text-xs font-semibold text-greenGray">
                {labels.altText}
              </label>
              <input id="media-alt" name="altEn" type="text" maxLength={300} className={inputClass} />
            </div>
            <label className="flex items-center gap-2 self-end text-sm">
              <input name="inGallery" type="checkbox" value="true" defaultChecked className="focus-ring h-4 w-4" />
              <span className="font-semibold text-charcoal">{labels.gallery}</span>
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              disabled={busy}
              className="rounded-full bg-greenGray px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
            >
              {busy ? labels.uploading : labels.upload}
            </button>
            {message ? (
              <p role="status" className={`text-xs font-bold ${isError ? "text-coralBase" : "text-greenGray"}`}>
                {message}
              </p>
            ) : null}
          </div>
        </form>
      ) : null}

      {images.length === 0 ? (
        <p className="text-sm text-charcoal/60">{labels.noImages}</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <li key={image.id} className="overflow-hidden rounded-lg border border-charcoal/10 bg-white">
              <div className="relative aspect-[4/3] bg-charcoal/5">
                <Image
                  src={image.url}
                  alt={image.alt_en || ""}
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="grid gap-2 p-3">
                <p className="truncate text-xs text-charcoal/60" title={image.storage_path}>
                  {image.alt_en || image.storage_path}
                </p>
                {canManage ? (
                  <button
                    type="button"
                    onClick={() => remove(image.id)}
                    disabled={busy}
                    className="focus-ring w-fit rounded-full border border-coralBase/40 px-3 py-1 text-xs font-bold text-coralBase disabled:opacity-60"
                  >
                    {labels.remove}
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
