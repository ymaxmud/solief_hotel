"use client";

import { useState } from "react";
import { AdminEditor } from "@/components/admin/AdminEditor";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { getDictionary } from "@/i18n/dictionary";

export default function AdminPage() {
  const t = getDictionary("en");
  const [authed, setAuthed] = useState(false);
  return authed ? <AdminEditor t={t} /> : <AdminLogin t={t} onSuccess={() => setAuthed(true)} />;
}
