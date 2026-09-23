/**
 * Upload validation for owner-managed hotel photography.
 *
 * Pure functions, so the security-relevant decisions are unit-testable without
 * a storage backend.
 */

export const MEDIA_BUCKET = "hotel-media";

/** 5 MB. Matches the bucket's own file_size_limit, which is the real enforcement. */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

const EXTENSION_BY_TYPE: Record<AllowedImageType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};

/**
 * Magic-number signatures.
 *
 * A client-declared Content-Type is attacker-controlled, so the declared type
 * must agree with what the bytes actually are. This is what stops an executable
 * or an SVG (which can carry script) being stored under an image MIME type in a
 * publicly readable bucket.
 */
export function sniffImageType(bytes: Uint8Array): AllowedImageType | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length >= 8 && png.every((byte, index) => bytes[index] === byte)) {
    return "image/png";
  }
  // RIFF....WEBP
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

export function isAllowedImageType(value: string): value is AllowedImageType {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(value);
}

/**
 * Build the object key for an upload.
 *
 * The uploaded filename is never used as a path. Only a slug of its stem
 * survives, so nothing in the key can be attacker-chosen beyond harmless
 * characters — no traversal (`..`, `/`, `\`), no absolute path, no leading dot,
 * and no way to target another image's key. A random suffix makes collisions
 * and deliberate overwrites of an existing object impractical.
 */
export function buildStoragePath(
  originalName: string,
  contentType: AllowedImageType,
  options: { now?: Date; random?: string } = {}
) {
  const now = options.now ?? new Date();
  const random = options.random ?? randomToken();

  // Take the basename only, then the stem, then reduce to a safe slug.
  const base = originalName.split(/[\\/]/).pop() || "image";
  const stem = base.replace(/\.[^.]*$/, "");
  const slug =
    stem
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "image";

  const folder = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  return `${folder}/${slug}-${random}.${EXTENSION_BY_TYPE[contentType]}`;
}

function randomToken() {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** Public URL for a stored object in the public hotel-media bucket. */
export function publicMediaUrl(supabaseUrl: string, storagePath: string) {
  return `${supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/public/${MEDIA_BUCKET}/${storagePath}`;
}
