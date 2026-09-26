import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { withRole, apiError } from "@/lib/crm/api";
import { logAudit } from "@/lib/crm/auth";
import { assertCan } from "@/lib/crm/permissions";
import {
  MAX_IMAGE_BYTES,
  MEDIA_BUCKET,
  buildStoragePath,
  isAllowedImageType,
  publicMediaUrl,
  sniffImageType
} from "@/lib/crm/media";
import { getSupabaseUrl } from "@/lib/supabase/keys";

// Reads the uploaded file into a Buffer, so this must be the Node runtime.
export const runtime = "nodejs";

const IMAGE_COLUMNS =
  "id,storage_path,room_category_id,in_gallery,display_order,is_active,alt_en,alt_ru,alt_uz,content_type,size_bytes,created_at";

export async function GET(request: Request) {
  return withRole(request, ["admin", "manager", "receptionist"], async ({ service }) => {
    const { data, error } = await service
      .from("hotel_images")
      .select(IMAGE_COLUMNS)
      .order("display_order", { ascending: true });
    if (error) return apiError("media:list", error);
    const supabaseUrl = getSupabaseUrl();
    return NextResponse.json({
      ok: true,
      data: (data ?? []).map((row) => ({ ...row, url: publicMediaUrl(supabaseUrl, row.storage_path) }))
    });
  });
}

export async function POST(request: Request) {
  return withRole(request, ["admin", "manager"], async ({ profile, service }) => {
    const allowed = assertCan(profile.role, "website:manage");
    if (!allowed.ok) return NextResponse.json({ ok: false, error: allowed.error }, { status: allowed.status });

    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid upload." }, { status: 400 });
    }

    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "Choose an image to upload." }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ ok: false, error: "The selected file is empty." }, { status: 400 });
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { ok: false, error: `Images must be ${Math.floor(MAX_IMAGE_BYTES / 1024 / 1024)} MB or smaller.` },
        { status: 400 }
      );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    // The declared Content-Type comes from the client and is not trusted: the
    // actual bytes decide the type, and the two must agree.
    const sniffed = sniffImageType(bytes);
    if (!sniffed) {
      return NextResponse.json({ ok: false, error: "Only JPEG, PNG and WebP images are supported." }, { status: 400 });
    }
    const declared = file.type || sniffed;
    if (!isAllowedImageType(declared) || declared !== sniffed) {
      return NextResponse.json({ ok: false, error: "The file contents do not match its type." }, { status: 400 });
    }

    const { data: hotel } = await service
      .from("hotels")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (!hotel) return NextResponse.json({ ok: false, error: "Hotel is not configured." }, { status: 400 });

    const storagePath = buildStoragePath(file.name, sniffed);
    const { error: uploadError } = await service.storage.from(MEDIA_BUCKET).upload(storagePath, bytes, {
      contentType: sniffed,
      // Never overwrite an existing object: a colliding key fails instead of
      // silently replacing another image.
      upsert: false
    });
    if (uploadError) return apiError("media:upload", uploadError);

    const roomCategoryId = asOptionalString(form.get("roomCategoryId"));
    const { data, error } = await service
      .from("hotel_images")
      .insert({
        hotel_id: hotel.id,
        storage_path: storagePath,
        room_category_id: roomCategoryId,
        in_gallery: form.get("inGallery") !== "false",
        alt_en: asOptionalString(form.get("altEn")),
        alt_ru: asOptionalString(form.get("altRu")),
        alt_uz: asOptionalString(form.get("altUz")),
        content_type: sniffed,
        size_bytes: file.size,
        uploaded_by: profile.id
      })
      .select(IMAGE_COLUMNS)
      .single();

    if (error) {
      // The object is already in storage but has no metadata row, which would
      // leave an orphan. Remove it so storage and the database stay consistent.
      await service.storage.from(MEDIA_BUCKET).remove([storagePath]);
      return apiError("media:record", error);
    }

    revalidatePath("/", "layout");
    await logAudit({
      request,
      actorUserId: profile.id,
      action: "create",
      entityType: "hotel_images",
      entityId: data.id,
      after: data
    });
    return NextResponse.json({ ok: true, data: { ...data, url: publicMediaUrl(getSupabaseUrl(), storagePath) } });
  });
}

export async function DELETE(request: Request) {
  return withRole(request, ["admin", "manager"], async ({ profile, service }) => {
    const allowed = assertCan(profile.role, "website:manage");
    if (!allowed.ok) return NextResponse.json({ ok: false, error: allowed.error }, { status: allowed.status });

    let body: { id?: string };
    try {
      body = (await request.json()) as { id?: string };
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
    }
    if (!body.id) return NextResponse.json({ ok: false, error: "Missing image id." }, { status: 400 });

    const { data: existing, error: readError } = await service
      .from("hotel_images")
      .select(IMAGE_COLUMNS)
      .eq("id", body.id)
      .maybeSingle();
    if (readError) return apiError("media:delete-read", readError);
    if (!existing) return NextResponse.json({ ok: false, error: "Image not found." }, { status: 404 });

    // Remove the metadata row first. If the storage delete then fails, the site
    // has no dangling reference — only an unreferenced object, which is
    // recoverable. The reverse order would leave a row pointing at nothing.
    const { error: deleteError } = await service.from("hotel_images").delete().eq("id", body.id);
    if (deleteError) return apiError("media:delete", deleteError);

    const { error: storageError } = await service.storage.from(MEDIA_BUCKET).remove([existing.storage_path]);
    if (storageError) {
      console.error("[media:delete] Metadata removed but the stored object remains", {
        storagePath: existing.storage_path,
        error: storageError.message
      });
    }

    revalidatePath("/", "layout");
    await logAudit({
      request,
      actorUserId: profile.id,
      action: "delete",
      entityType: "hotel_images",
      entityId: body.id,
      before: existing
    });
    return NextResponse.json({ ok: true, storageRemoved: !storageError });
  });
}

function asOptionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, 300) : null;
}
