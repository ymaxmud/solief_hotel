"use client";

import { createContext, useContext, useMemo } from "react";
import { getFallbackSiteData, type PublicSiteData } from "@/lib/public/types";

/**
 * Owner-editable hotel data, loaded on the server and handed to the client tree.
 *
 * The default value is the bundled launch content, so a component rendered
 * outside a provider (a legal page, a test) still gets correct data instead of
 * crashing or showing blanks.
 */
const SiteDataContext = createContext<PublicSiteData | null>(null);

export function SiteDataProvider({ data, children }: { data: PublicSiteData; children: React.ReactNode }) {
  // `data` arrives as a fresh object on every server render; memoizing keeps
  // consumers from re-rendering when nothing about it actually changed.
  const value = useMemo(() => data, [data]);
  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>;
}

// Built once at module scope rather than per call, so `useSiteData()` returns a
// stable object identity when no provider is mounted.
const FALLBACK = getFallbackSiteData();

export function useSiteData(): PublicSiteData {
  return useContext(SiteDataContext) ?? FALLBACK;
}
