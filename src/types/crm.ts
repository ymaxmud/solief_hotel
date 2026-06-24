export type UserRole = "admin" | "manager" | "receptionist";
export type BookingStatus = "new" | "contacted" | "confirmed" | "rejected" | "cancelled" | "no_show";
export type StaffStatus = "active" | "inactive";
export type RoomStatus = "available" | "occupied" | "cleaning" | "maintenance" | "out_of_service";
export type RoomCleaningStatus = "clean" | "dirty" | "in_progress" | "inspected";
export type ServiceType =
  | "reception"
  | "cleaning"
  | "luggage"
  | "airport_transfer"
  | "maintenance"
  | "complaint"
  | "room_service"
  | "other";
export type ServiceStatus = "open" | "in_progress" | "done" | "cancelled";

export type AppUser = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
};

export type StaffMember = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  status: StaffStatus;
};

export type BookingRequestRow = {
  id: string;
  public_reference: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  guests_count: number;
  check_in: string;
  check_out: string;
  room_type: string;
  preferred_contact: string;
  preferred_language: string;
  message: string | null;
  status: BookingStatus;
  created_at: string;
  assigned_staff_id: string | null;
};
