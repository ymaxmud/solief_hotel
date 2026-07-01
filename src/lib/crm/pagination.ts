export const adminPageSize = 25;

export function getPage(searchParams: Record<string, string | string[] | undefined>) {
  const raw = Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page;
  const page = Number.parseInt(raw || "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export function getRange(page: number, pageSize = adminPageSize) {
  const from = (page - 1) * pageSize;
  return { from, to: from + pageSize - 1 };
}

export function getParam(searchParams: Record<string, string | string[] | undefined>, key: string) {
  const value = searchParams[key];
  return (Array.isArray(value) ? value[0] : value)?.trim() || "";
}

export function searchTerm(value: string) {
  return value.replace(/[%(),]/g, " ").trim();
}

export function buildPageHref(pathname: string, searchParams: Record<string, string | string[] | undefined>, page: number) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first && key !== "page") params.set(key, first);
  }
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}
