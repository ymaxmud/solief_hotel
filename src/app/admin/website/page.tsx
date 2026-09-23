import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCard } from "@/components/admin/AdminCard";
import { WebsiteSettingsForm } from "@/components/admin/WebsiteSettingsForm";
import { AmenityToggle } from "@/components/admin/AmenityToggle";
import { MediaManager, type HotelImageRow } from "@/components/admin/MediaManager";
import { publicMediaUrl } from "@/lib/crm/media";
import { getSupabaseUrl } from "@/lib/supabase/keys";
import { getAdminPageContext } from "@/lib/crm/adminPage";
import { amenities as amenityCatalogue } from "@/content/amenities";
import type { Locale } from "@/types";

export const dynamic = "force-dynamic";

type HotelRow = {
  id: string;
  name: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  whatsapp_url: string | null;
  telegram_url: string | null;
  google_maps_url: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
  google_rating: number | string | null;
  google_review_count: number | null;
  google_reviews_url: string | null;
  usd_rate_uzs: number | string | null;
  eur_rate_uzs: number | string | null;
};

type CategoryRow = {
  id: string;
  slug: string | null;
  name_en: string | null;
  name_ru: string | null;
  name_uz: string | null;
  description_en: string | null;
  description_ru: string | null;
  description_uz: string | null;
  base_price_uzs: number | string | null;
  capacity: number | null;
  is_active: boolean | null;
};

export default async function WebsitePage() {
  // Read-only viewing is open to any signed-in staff member; every mutation is
  // authorized again server-side in /api/admin/website.
  const { user, locale, t, service } = await getAdminPageContext();
  const canManage = user.role === "admin" || user.role === "manager";

  const [hotelResult, categoryResult, amenityResult] = await Promise.all([
    service
      .from("hotels")
      .select(
        "id,name,address,phone,email,whatsapp_url,telegram_url,google_maps_url,check_in_time,check_out_time,google_rating,google_review_count,google_reviews_url,usd_rate_uzs,eur_rate_uzs"
      )
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    service
      .from("room_categories")
      .select("id,slug,name_en,name_ru,name_uz,description_en,description_ru,description_uz,base_price_uzs,capacity,is_active")
      .order("display_order", { ascending: true }),
    service.from("hotel_amenities").select("amenity_key,is_active")
  ]);

  // Photos are non-essential: if the media table is missing or unreadable, the
  // rest of the settings page must still render.
  const imageResult = await service
    .from("hotel_images")
    .select("id,storage_path,room_category_id,in_gallery,alt_en")
    .eq("is_active", true)
    .order("display_order", { ascending: true });
  if (imageResult.error) {
    console.error("[admin:website] Could not read hotel images", { error: imageResult.error.message });
  }
  const supabaseUrl = getSupabaseUrl();
  const images: HotelImageRow[] = (
    (imageResult.data as Omit<HotelImageRow, "url">[] | null) ?? []
  ).map((row) => ({ ...row, url: publicMediaUrl(supabaseUrl, row.storage_path) }));

  const hotel = hotelResult.data as HotelRow | null;
  const categories = (categoryResult.data as CategoryRow[] | null) ?? [];
  const amenityRows = (amenityResult.data as { amenity_key: string; is_active: boolean }[] | null) ?? [];
  const disabled = new Set(amenityRows.filter((row) => !row.is_active).map((row) => row.amenity_key));

  return (
    <AdminShell user={user}>
      <h1 className="font-display text-4xl">{t.website}</h1>
      <p className="mt-2 max-w-3xl text-sm text-charcoal/65">{t.websiteIntro}</p>

      {hotelResult.error || !hotel ? (
        <p className="mt-6 rounded-lg bg-coralBase/10 p-4 text-sm font-semibold text-coralBase">{t.loadError}</p>
      ) : (
        <div className="mt-6 grid gap-6">
          <AdminCard title={t.websiteContact}>
            {canManage ? (
              <WebsiteSettingsForm
                endpoint="/api/admin/website"
                payload={{ id: hotel.id, kind: "hotel" }}
                submitLabel={t.save}
                savedLabel={t.saved}
                saveFailedLabel={t.saveFailed}
                loadingLabel={t.loading}
                fields={[
                  { name: "name", label: t.hotelName, defaultValue: hotel.name, required: true },
                  { name: "phone", label: t.phone, defaultValue: hotel.phone, required: true, hint: t.phoneHint },
                  { name: "email", label: t.email, type: "email", defaultValue: hotel.email },
                  { name: "address", label: t.address, defaultValue: hotel.address, required: true },
                  { name: "whatsappUrl", label: "WhatsApp", type: "url", defaultValue: hotel.whatsapp_url, hint: t.linkHint },
                  { name: "telegramUrl", label: "Telegram", type: "url", defaultValue: hotel.telegram_url, hint: t.linkHint },
                  { name: "googleMapsUrl", label: t.googleMapsUrl, type: "url", defaultValue: hotel.google_maps_url, hint: t.linkHint },
                  { name: "checkInTime", label: t.checkInTime, type: "time", defaultValue: hotel.check_in_time },
                  { name: "checkOutTime", label: t.checkOutTime, type: "time", defaultValue: hotel.check_out_time }
                ]}
              />
            ) : (
              <ReadOnlySummary
                rows={[
                  [t.hotelName, hotel.name],
                  [t.phone, hotel.phone],
                  [t.email, hotel.email],
                  [t.address, hotel.address],
                  [t.checkInTime, hotel.check_in_time],
                  [t.checkOutTime, hotel.check_out_time]
                ]}
                emptyLabel={t.noData}
              />
            )}
          </AdminCard>

          <AdminCard title={t.websiteReviews}>
            <p className="mb-4 text-xs leading-5 text-charcoal/60">{t.websiteReviewsHint}</p>
            {canManage ? (
              <WebsiteSettingsForm
                endpoint="/api/admin/website"
                payload={{ id: hotel.id, kind: "hotel" }}
                submitLabel={t.save}
                savedLabel={t.saved}
                saveFailedLabel={t.saveFailed}
                loadingLabel={t.loading}
                fields={[
                  {
                    name: "googleRating",
                    label: t.googleRating,
                    type: "number",
                    step: "0.1",
                    min: 0,
                    max: 5,
                    defaultValue: hotel.google_rating === null ? "" : String(hotel.google_rating)
                  },
                  {
                    name: "googleReviewCount",
                    label: t.googleReviewCount,
                    type: "number",
                    min: 0,
                    defaultValue: hotel.google_review_count === null ? "" : String(hotel.google_review_count)
                  },
                  {
                    name: "googleReviewsUrl",
                    label: t.googleReviewsUrl,
                    type: "url",
                    defaultValue: hotel.google_reviews_url,
                    hint: t.linkHint
                  }
                ]}
              />
            ) : (
              <ReadOnlySummary
                rows={[
                  [t.googleRating, hotel.google_rating === null ? null : String(hotel.google_rating)],
                  [t.googleReviewCount, hotel.google_review_count === null ? null : String(hotel.google_review_count)]
                ]}
                emptyLabel={t.noData}
              />
            )}
          </AdminCard>

          <AdminCard title={t.websiteCurrency}>
            <p className="mb-4 text-xs leading-5 text-charcoal/60">{t.websiteCurrencyHint}</p>
            {canManage ? (
              <WebsiteSettingsForm
                endpoint="/api/admin/website"
                payload={{ id: hotel.id, kind: "hotel" }}
                submitLabel={t.save}
                savedLabel={t.saved}
                saveFailedLabel={t.saveFailed}
                loadingLabel={t.loading}
                fields={[
                  {
                    name: "usdRateUzs",
                    label: t.usdRate,
                    type: "number",
                    step: "1",
                    min: 1,
                    defaultValue: hotel.usd_rate_uzs === null ? "" : String(hotel.usd_rate_uzs)
                  },
                  {
                    name: "eurRateUzs",
                    label: t.eurRate,
                    type: "number",
                    step: "1",
                    min: 1,
                    defaultValue: hotel.eur_rate_uzs === null ? "" : String(hotel.eur_rate_uzs)
                  }
                ]}
              />
            ) : (
              <ReadOnlySummary
                rows={[
                  [t.usdRate, hotel.usd_rate_uzs === null ? null : String(hotel.usd_rate_uzs)],
                  [t.eurRate, hotel.eur_rate_uzs === null ? null : String(hotel.eur_rate_uzs)]
                ]}
                emptyLabel={t.noData}
              />
            )}
          </AdminCard>

          <AdminCard title={t.websiteRoomCategories}>
            <p className="mb-4 text-xs leading-5 text-charcoal/60">{t.websiteRoomCategoriesHint}</p>
            {categories.length === 0 ? (
              <p className="text-sm text-charcoal/60">{t.noData}</p>
            ) : (
              <div className="grid gap-6">
                {categories.map((category) => (
                  <section key={category.id} className="rounded-lg border border-charcoal/10 p-4">
                    <h3 className="text-sm font-bold text-charcoal">
                      {category.name_en || category.slug}
                      {category.is_active === false ? ` — ${t.inactive}` : ""}
                    </h3>
                    {canManage ? (
                      <div className="mt-3">
                        <WebsiteSettingsForm
                          endpoint="/api/admin/website"
                          payload={{ id: category.id, kind: "roomCategory" }}
                          submitLabel={t.save}
                          savedLabel={t.saved}
                          saveFailedLabel={t.saveFailed}
                          loadingLabel={t.loading}
                          fields={[
                            { name: "nameEn", label: `${t.name} (EN)`, defaultValue: category.name_en, required: true },
                            { name: "nameRu", label: `${t.name} (RU)`, defaultValue: category.name_ru, required: true },
                            { name: "nameUz", label: `${t.name} (UZ)`, defaultValue: category.name_uz, required: true },
                            {
                              name: "basePriceUzs",
                              label: t.basePriceUzs,
                              type: "number",
                              min: 0,
                              step: "1000",
                              defaultValue: category.base_price_uzs === null ? "" : String(category.base_price_uzs)
                            },
                            {
                              name: "capacity",
                              label: t.capacity,
                              type: "number",
                              min: 1,
                              max: 30,
                              defaultValue: category.capacity === null ? "" : String(category.capacity)
                            },
                            { name: "descriptionEn", label: `${t.description} (EN)`, type: "textarea", defaultValue: category.description_en },
                            { name: "descriptionRu", label: `${t.description} (RU)`, type: "textarea", defaultValue: category.description_ru },
                            { name: "descriptionUz", label: `${t.description} (UZ)`, type: "textarea", defaultValue: category.description_uz }
                          ]}
                        />
                      </div>
                    ) : (
                      <ReadOnlySummary
                        rows={[
                          [t.basePriceUzs, category.base_price_uzs === null ? null : String(category.base_price_uzs)],
                          [t.capacity, category.capacity === null ? null : String(category.capacity)]
                        ]}
                        emptyLabel={t.noData}
                      />
                    )}
                  </section>
                ))}
              </div>
            )}
          </AdminCard>

          <AdminCard title={t.websiteMedia}>
            <p className="mb-4 text-xs leading-5 text-charcoal/60">{t.websiteMediaHint}</p>
            <MediaManager
              images={images}
              canManage={canManage}
              categories={categories.map((category) => ({
                id: category.id,
                label: category.name_en || category.slug || category.id
              }))}
              labels={{
                upload: t.mediaUpload,
                uploading: t.mediaUploading,
                uploaded: t.mediaUploaded,
                uploadFailed: t.mediaUploadFailed,
                remove: t.mediaRemove,
                removeConfirm: t.mediaRemoveConfirm,
                removed: t.mediaRemoved,
                removeFailed: t.mediaRemoveFailed,
                category: t.category,
                gallery: t.mediaGallery,
                altText: t.mediaAltText,
                none: t.mediaNone,
                noImages: t.mediaNoImages,
                fileHint: t.mediaFileHint
              }}
            />
          </AdminCard>

          <AdminCard title={t.websiteAmenities}>
            <p className="mb-4 text-xs leading-5 text-charcoal/60">{t.websiteAmenitiesHint}</p>
            <div className="grid gap-2 md:grid-cols-2">
              {amenityCatalogue.map((amenity) => (
                <AmenityToggle
                  key={amenity.id}
                  amenityKey={amenity.id}
                  label={amenity.title[locale as Locale] ?? amenity.title.en}
                  isActive={!disabled.has(amenity.id)}
                  savedLabel={t.saved}
                  saveFailedLabel={canManage ? t.saveFailed : t.forbidden}
                />
              ))}
            </div>
          </AdminCard>
        </div>
      )}
    </AdminShell>
  );
}

function ReadOnlySummary({ rows, emptyLabel }: { rows: Array<[string, string | null]>; emptyLabel: string }) {
  return (
    <dl className="grid gap-2 text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="flex flex-wrap gap-2">
          <dt className="min-w-40 font-semibold text-greenGray">{label}</dt>
          <dd className="text-charcoal">{value || emptyLabel}</dd>
        </div>
      ))}
    </dl>
  );
}
