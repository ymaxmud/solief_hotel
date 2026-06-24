export function getRequiredServerEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function getPublicHotelCoordinates() {
  return {
    lat: Number(process.env.NEXT_PUBLIC_HOTEL_LAT || "41.2683062"),
    lng: Number(process.env.NEXT_PUBLIC_HOTEL_LNG || "69.2038021"),
    radiusMeters: Number(process.env.NEXT_PUBLIC_ATTENDANCE_RADIUS_METERS || "150")
  };
}
