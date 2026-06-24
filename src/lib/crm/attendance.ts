import crypto from "crypto";
import { getPublicHotelCoordinates } from "@/lib/env";

export function createAttendanceToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashAttendanceToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function distanceMeters(from: { lat: number; lng: number }, to = getPublicHotelCoordinates()) {
  const earthRadius = 6371000;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function isWithinAttendanceRadius(point: { lat: number; lng: number }) {
  const hotel = getPublicHotelCoordinates();
  const distance = distanceMeters(point, hotel);
  return {
    ok: distance <= hotel.radiusMeters,
    distance,
    radius: hotel.radiusMeters
  };
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}
