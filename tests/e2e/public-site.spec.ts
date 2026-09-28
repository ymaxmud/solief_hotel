import { expect, test } from "@playwright/test";

/**
 * Public site smoke tests.
 *
 * These run against dummy Supabase credentials, so anything that needs the real
 * database is asserted on its failure behaviour instead — most importantly that
 * a booking never reports success when it was not persisted.
 */

/**
 * Wait until React has hydrated.
 *
 * The cookie notice is rendered from a useEffect that reads localStorage, so it
 * is absent in the server HTML and appears only once the client tree is live.
 * Clicking before that point hits markup with no handler attached, and
 * Playwright's actionability checks cannot detect it.
 */
async function waitForHydration(page: import("@playwright/test").Page) {
  await expect(page.getByTestId("cookie-consent")).toBeVisible();
}

test.describe("public site", () => {
  test("home page renders the hotel's confirmed contact channels", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Solief Hotel/);

    const hero = page.locator("#top");
    await expect(hero.getByRole("link", { name: /call hotel/i })).toHaveAttribute("href", "tel:+998983624949");
    await expect(hero.getByRole("link", { name: /whatsapp/i })).toHaveAttribute("href", /wa\.me\/998983624949/);
    await expect(hero.getByRole("link", { name: /telegram/i })).toHaveAttribute("href", "https://t.me/soliefhotel");
  });

  test("shows the four confirmed room categories at their UZS rates", async ({ page }) => {
    await page.goto("/");
    const rooms = page.locator("#rooms");
    for (const [name, price] of [
      ["Standard Double or Twin Room", "500,000"],
      ["Twin Suite", "650,000"],
      ["Deluxe Triple Room", "700,700"],
      ["Deluxe Quadruple Room", "1,000,000"]
    ]) {
      await expect(rooms.getByText(name).first()).toBeVisible();
      await expect(rooms.getByText(price).first()).toBeVisible();
    }
  });

  test("switches between EN, RU and UZ by navigating to each language's URL", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);
    const languages = () => page.getByRole("group", { name: "Language" }).first();

    await languages().getByRole("link", { name: "Русский" }).click();
    await expect(page).toHaveURL(/\/ru$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
    await expect(page.locator("h1")).toContainText("Ташкенте");

    await languages().getByRole("link", { name: "O‘zbekcha" }).click();
    await expect(page).toHaveURL(/\/uz$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "uz");
    await expect(page.locator("h1")).toContainText("Toshkentda");

    await languages().getByRole("link", { name: "English" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    // The active language is conveyed to assistive tech, not by colour alone.
    await expect(languages().getByRole("link", { name: "English" })).toHaveAttribute("aria-current", "page");
  });

  test("serves each language server-side, with truthful hreflang", async ({ request }) => {
    for (const [path, lang, heading] of [
      ["/", "en", "Tashkent"],
      ["/ru", "ru", "Ташкенте"],
      ["/uz", "uz", "Toshkentda"]
    ] as const) {
      const response = await request.get(path);
      expect(response.status()).toBe(200);
      const html = await response.text();

      // No JavaScript has run here: this is what a crawler sees.
      expect(html).toContain(`<html lang="${lang}"`);
      expect(html).toContain(heading);

      // Every page declares the same three alternates plus x-default, and is
      // canonical to itself rather than to another language.
      for (const alternate of ["en", "ru", "uz", "x-default"]) {
        expect(html).toContain(`hrefLang="${alternate}"`);
      }
      // Compare paths, not whole URLs: the canonical host comes from SITE_URL,
      // which differs between this test run and production.
      const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
      expect(canonical).toBeTruthy();
      expect(new URL(canonical!).pathname).toBe(path);
    }
  });

  test("404s an unsupported language instead of serving English at its URL", async ({ request }) => {
    expect((await request.get("/de")).status()).toBe(404);
  });

  // Regression guard: with `dynamicParams = false` on the [lang] route, these
  // pages 404'd permanently the first time an owner edit called revalidatePath —
  // dropping the prerendered entry left Next.js unable to regenerate a param it
  // was forbidden to render on demand. Serving them twice would not catch that,
  // so this asserts they survive a cache miss.
  test("keeps serving the localized pages when they are not prerendered", async ({ request }) => {
    for (const path of ["/ru", "/uz"]) {
      // Cache-busting query: the route still has to render, not 404.
      const response = await request.get(`${path}?cachebust=${Date.now()}`);
      expect(response.status()).toBe(200);
      expect(await response.text()).toContain(`<html lang="${path.slice(1)}"`);
    }
  });

  test("keeps old ?lang= links working", async ({ page }) => {
    await page.goto("/?lang=ru");
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
    expect(new URL(page.url()).pathname).toBe("/ru");
  });

  test("converts prices to USD and EUR without producing NaN", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);
    const currency = page.getByLabel("Currency");
    for (const code of ["USD", "EUR", "UZS"]) {
      await currency.selectOption(code);
      await expect(page.locator("#rooms")).not.toContainText("NaN");
    }
  });

  test("opens the booking request modal and closes it with Escape", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);
    await page.locator("#top").getByRole("button", { name: /send booking request/i }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel(/full name/i)).toBeVisible();

    // Past dates must not be selectable in the UI.
    const today = new Date().toISOString().slice(0, 10);
    await expect(dialog.getByLabel(/check-in/i)).toHaveAttribute("min", today);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("privacy and terms pages load", async ({ page }) => {
    for (const path of ["/privacy", "/terms"]) {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
    }
  });

  test("serves robots and a sitemap that use the configured site URL", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    const robotsBody = await robots.text();
    expect(robotsBody).toContain("Disallow: /admin");
    expect(robotsBody).toContain("/sitemap.xml");

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).toContain("127.0.0.1:3000");
  });

  test("returns 404 for an unknown page", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBe(404);
  });
});

test.describe("booking request API", () => {
  function future(days: number) {
    return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
  }

  const base = {
    name: `E2E Solief Test ${Date.now()}`,
    phone: "+998901234567",
    email: "",
    guests: 2,
    roomType: "Standard Double or Twin Room",
    roomId: "standard-double-twin",
    language: "EN",
    contactMethod: "Phone",
    message: ""
  };

  test("rejects a check-in date in the past", async ({ request }) => {
    const response = await request.post("/api/booking-request", {
      data: { ...base, checkIn: "2020-01-01", checkOut: "2020-01-03" }
    });
    expect(response.status()).toBe(400);
    const json = await response.json();
    expect(json.ok).toBe(false);
    expect(JSON.stringify(json)).toContain("past");
  });

  test("rejects check-out on or before check-in", async ({ request }) => {
    const response = await request.post("/api/booking-request", {
      data: { ...base, checkIn: future(10), checkOut: future(10) }
    });
    expect(response.status()).toBe(400);
  });

  test("rejects a malformed body without leaking a stack trace", async ({ request }) => {
    const response = await request.post("/api/booking-request", {
      headers: { "content-type": "application/json" },
      data: "{not json"
    });
    expect(response.status()).toBe(400);
    const body = await response.text();
    expect(body).not.toContain("at ");
    expect(body).not.toContain("node_modules");
  });

  test("never reports success when the request could not be stored", async ({ request }) => {
    // The E2E environment has no real database, so persistence must fail — and
    // the guest must not be told the request was received.
    const response = await request.post("/api/booking-request", {
      data: { ...base, checkIn: future(10), checkOut: future(12) }
    });
    expect(response.ok()).toBe(false);
    const json = await response.json();
    expect(json.ok).toBe(false);
    expect(json.reference).toBeUndefined();
  });
});

test.describe("admin access control", () => {
  for (const path of ["/admin", "/admin/dashboard", "/admin/website", "/admin/users", "/admin/reports"]) {
    test(`redirects unauthenticated access to ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/admin\/login/);
    });
  }

  for (const path of ["/api/admin/website", "/api/admin/users", "/api/admin/staff", "/api/admin/media"]) {
    test(`rejects unauthenticated API access to ${path}`, async ({ request }) => {
      const response = await request.get(path);
      expect(response.status()).toBe(401);
    });
  }

  test("rejects an unauthenticated website settings mutation", async ({ request }) => {
    const response = await request.fetch("/api/admin/website", {
      method: "PATCH",
      data: { id: "11111111-1111-4111-8111-111111111111", name: "Unauthorized change" }
    });
    expect(response.status()).toBe(401);
  });
});
