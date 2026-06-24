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
