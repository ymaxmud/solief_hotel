export function createBookingReference(now = new Date()) {
  const date = now.toISOString().slice(0, 10).replaceAll("-", "");
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SOL-${date}-${random}`;
}
