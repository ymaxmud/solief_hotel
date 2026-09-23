import { describe, expect, it } from "vitest";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  buildStoragePath,
  isAllowedImageType,
  publicMediaUrl,
  sniffImageType
} from "@/lib/crm/media";

function bytes(...values: number[]) {
  return new Uint8Array(values);
}

const JPEG = bytes(0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10);
const PNG = bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00);
const WEBP = bytes(0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50);

describe("image type sniffing", () => {
  it("recognizes the supported formats from their magic bytes", () => {
    expect(sniffImageType(JPEG)).toBe("image/jpeg");
    expect(sniffImageType(PNG)).toBe("image/png");
    expect(sniffImageType(WEBP)).toBe("image/webp");
  });

  it("rejects content that is not one of the supported images", () => {
    // An ELF binary, an SVG (which can carry script), a PDF, and empty input.
    expect(sniffImageType(bytes(0x7f, 0x45, 0x4c, 0x46))).toBeNull();
    expect(sniffImageType(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><script/></svg>'))).toBeNull();
    expect(sniffImageType(new TextEncoder().encode("%PDF-1.7"))).toBeNull();
    expect(sniffImageType(bytes())).toBeNull();
  });

  it("does not mistake a truncated header for a valid image", () => {
    expect(sniffImageType(bytes(0xff, 0xd8))).toBeNull();
    expect(sniffImageType(bytes(0x89, 0x50, 0x4e))).toBeNull();
    expect(sniffImageType(bytes(0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0))).toBeNull();
  });

  it("only allows the three documented MIME types", () => {
    expect(ALLOWED_IMAGE_TYPES).toEqual(["image/jpeg", "image/png", "image/webp"]);
    expect(isAllowedImageType("image/svg+xml")).toBe(false);
    expect(isAllowedImageType("text/html")).toBe(false);
    expect(isAllowedImageType("image/png")).toBe(true);
  });

  it("caps uploads at 5 MB", () => {
    expect(MAX_IMAGE_BYTES).toBe(5 * 1024 * 1024);
  });
});

describe("storage path generation", () => {
  const now = new Date("2026-09-22T00:00:00Z");

  it("builds a dated, extension-correct key", () => {
    expect(buildStoragePath("Lobby Photo.JPG", "image/jpeg", { now, random: "abc123" })).toBe(
      "2026/09/lobby-photo-abc123.jpg"
    );
  });

  it("strips path traversal and directory components from the filename", () => {
    for (const name of [
      "../../../etc/passwd.png",
      "..\\..\\windows\\system32\\evil.png",
      "/etc/shadow.png",
      "....//....//x.png"
    ]) {
      const path = buildStoragePath(name, "image/png", { now, random: "r" });
      expect(path).toBe(`2026/09/${path.split("/")[2]}`);
      expect(path).not.toContain("..");
      expect(path.split("/")).toHaveLength(3);
      expect(path.endsWith(".png")).toBe(true);
    }
  });

  it("never lets the uploaded name choose the extension", () => {
    const path = buildStoragePath("payload.php", "image/webp", { now, random: "r" });
    expect(path.endsWith(".webp")).toBe(true);
    expect(path).not.toContain(".php");
  });

  it("falls back to a safe slug when the name has nothing usable", () => {
    expect(buildStoragePath("...", "image/jpeg", { now, random: "r" })).toBe("2026/09/image-r.jpg");
    expect(buildStoragePath("", "image/jpeg", { now, random: "r" })).toBe("2026/09/image-r.jpg");
    expect(buildStoragePath("🙂🙂🙂.jpg", "image/jpeg", { now, random: "r" })).toBe("2026/09/image-r.jpg");
  });

  it("produces a different key for the same filename each time", () => {
    const a = buildStoragePath("room.jpg", "image/jpeg");
    const b = buildStoragePath("room.jpg", "image/jpeg");
    expect(a).not.toBe(b);
  });

  it("builds the public URL without a duplicate slash", () => {
    expect(publicMediaUrl("https://example.supabase.co/", "2026/09/a.jpg")).toBe(
      "https://example.supabase.co/storage/v1/object/public/hotel-media/2026/09/a.jpg"
    );
  });
});
