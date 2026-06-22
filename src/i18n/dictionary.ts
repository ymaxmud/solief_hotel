import type { Locale } from "@/types";
import { en } from "./en";
import { ru } from "./ru";
import { uz } from "./uz";

export const dictionaries = { en, ru, uz };
export type Dictionary = typeof en;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] || dictionaries.en;
}
