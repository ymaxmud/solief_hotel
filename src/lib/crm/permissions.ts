import type { UserRole } from "@/types/crm";

export type CrmAction =
  | "booking:mark_contacted"
  | "booking:assign_staff"
  | "booking:confirm"
  | "booking:reject"
  | "booking:cancel"
  | "booking:reopen"
  | "booking:no_show"
  | "stay:create"
  | "stay:update"
  | "service:create"
  | "service:update"
  | "room:update"
  | "staff:manage"
  | "user:manage"
  | "attendance:manual"
  | "attendance:review"
  | "export:attendance"
  | "export:bookings"
  | "export:services"
  | "export:guests"
  | "export:stays";

const actionRoles: Record<CrmAction, UserRole[]> = {
  "booking:mark_contacted": ["admin", "manager", "receptionist"],
  "booking:assign_staff": ["admin", "manager"],
  "booking:confirm": ["admin", "manager"],
  "booking:reject": ["admin", "manager"],
  "booking:cancel": ["admin", "manager"],
  "booking:reopen": ["admin", "manager"],
  "booking:no_show": ["admin", "manager"],
  "stay:create": ["admin", "manager"],
  "stay:update": ["admin", "manager"],
  "service:create": ["admin", "manager"],
  "service:update": ["admin", "manager"],
  "room:update": ["admin", "manager"],
  "staff:manage": ["admin", "manager"],
  "user:manage": ["admin"],
  "attendance:manual": ["admin", "manager"],
  "attendance:review": ["admin", "manager"],
  "export:attendance": ["admin", "manager"],
  "export:bookings": ["admin", "manager"],
  "export:services": ["admin", "manager"],
  "export:guests": ["admin"],
  "export:stays": ["admin"]
};

export function can(role: UserRole, action: CrmAction) {
  return actionRoles[action].includes(role);
}

export function assertCan(role: UserRole, action: CrmAction) {
  if (!can(role, action)) {
    return { ok: false as const, error: "Forbidden", status: 403 };
  }
  return { ok: true as const };
}

export function bookingStatusAction(status: string | undefined) {
  if (status === "contacted") return "booking:mark_contacted" as const;
  if (status === "confirmed") return "booking:confirm" as const;
  if (status === "rejected") return "booking:reject" as const;
  if (status === "cancelled") return "booking:cancel" as const;
  if (status === "new") return "booking:reopen" as const;
  if (status === "no_show") return "booking:no_show" as const;
  return null;
}
