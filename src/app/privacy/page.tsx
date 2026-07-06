import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — Solief Hotel",
  description: "How Solief Hotel collects and uses your personal data when you send a booking request.",
  alternates: { canonical: "/privacy" }
};

export default function PrivacyPage() {
  return <LegalPage doc="privacy" />;
}
