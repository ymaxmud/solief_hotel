import { NextResponse } from "next/server";
import type { UserRole } from "@/types/crm";
import type { AppUser } from "@/types/crm";
import { requireApiRole, logAudit } from "@/lib/crm/auth";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function withRole(request: Request, roles: UserRole[], handler: (ctx: { profile: AppUser; service: ReturnType<typeof createSupabaseServiceClient> }) => Promise<Response>) {
  const auth = await requireApiRole(roles);
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  return handler({ profile: auth.profile, service: createSupabaseServiceClient() });
}

export async function insertAudit(request: Request, actorUserId: string, action: string, entityType: string, entityId: string | null, after: unknown) {
  await logAudit({ request, actorUserId, action, entityType, entityId, after });
}

/**
 * Log the underlying error server-side and return a generic client-facing JSON
 * response. Prevents leaking raw database/provider error text (schema names, SQL,
 * constraint details) to the browser. Pass `message` for a caller-safe, user-facing
 * string such as a mapped domain error.
 */
export function apiError(scope: string, error: unknown, options?: { status?: number; message?: string }) {
  const status = options?.status ?? 500;
  const message = options?.message ?? "Something went wrong. Please try again.";
  const detail = error && typeof error === "object" && "message" in error ? (error as { message?: unknown }).message : error;
  if (detail) console.error(`[api:${scope}]`, detail);
  return NextResponse.json({ ok: false, error: message }, { status });
}
