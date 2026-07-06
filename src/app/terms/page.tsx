import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service — Solief Hotel",
  description: "Terms governing use of the Solief Hotel website and booking request feature.",
  alternates: { canonical: "/terms" }
};

export default function TermsPage() {
  return <LegalPage doc="terms" />;
}
