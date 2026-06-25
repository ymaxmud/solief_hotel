import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.INITIAL_ADMIN_EMAIL;
const password = process.env.INITIAL_ADMIN_PASSWORD;
const allowBootstrap = process.env.ALLOW_INITIAL_ADMIN_BOOTSTRAP === "true";
const nodeEnv = process.env.NODE_ENV || process.env.VERCEL_ENV || "development";

if (!url || !serviceKey || !email || !password) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, INITIAL_ADMIN_EMAIL, or INITIAL_ADMIN_PASSWORD");
  process.exit(1);
}

if (nodeEnv === "production" && !allowBootstrap) {
  console.error("Refusing initial admin bootstrap in production without ALLOW_INITIAL_ADMIN_BOOTSTRAP=true.");
  process.exit(1);
}

if (isWeakPassword(password)) {
  console.error("Refusing weak/default INITIAL_ADMIN_PASSWORD. Use a unique password with at least 12 characters, including letters and numbers.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const { data: existing } = await supabase.from("app_users").select("id,email").eq("email", email).maybeSingle();
if (existing) {
  console.log(`Initial admin already exists: ${email}`);
  process.exit(0);
}

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { full_name: "Initial Admin", role: "admin", force_password_change: true }
});

if (error || !data.user) {
  console.error(error?.message || "Could not create auth user");
  process.exit(1);
}

const { error: insertError } = await supabase.from("app_users").insert({
  id: data.user.id,
  email,
  full_name: "Initial Admin",
  role: "admin",
  is_active: true,
  force_password_change: true
});

if (insertError) {
  console.error(insertError.message);
  process.exit(1);
}

console.log(`Initial admin created: ${email}`);

function isWeakPassword(value) {
  const normalized = String(value || "").toLowerCase();
  const blocked = new Set([
    "1234demo",
    "password",
    "password123",
    "admin123",
    "demo1234",
    "solief123",
    "changeme",
    "qwerty123"
  ]);
  return (
    value.length < 12 ||
    blocked.has(normalized) ||
    !/[a-z]/i.test(value) ||
    !/[0-9]/.test(value)
  );
}
