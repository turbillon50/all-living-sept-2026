import { test, expect } from "@playwright/test";

/** Flujos públicos: splash → brand → rol → auth. No dependen de credenciales. */
test.describe("Entrada a All Living", () => {
  test("el anillo abre y lleva al brand moment", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("status")).toBeVisible();
    await page.waitForURL(/\/(welcome|home|onboarding)/, { timeout: 8000 });
  });

  test("welcome muestra la promesa y dos caminos", async ({ page }) => {
    await page.goto("/welcome");
    await expect(page.getByRole("heading", { name: /Más que propiedades/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Comenzar" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Ya tengo cuenta" })).toBeVisible();
  });

  test("elegir rol lleva a crear cuenta", async ({ page }) => {
    await page.goto("/welcome/role");
    await expect(page.getByRole("heading", { name: /vivir All Living/ })).toBeVisible();
    await page.getByRole("button", { name: /Soy propietario/ }).click();
    await page.waitForURL(/\/(sign-up|onboarding)/, { timeout: 10000 });
  });

  test("offline y 404 no son páginas blancas", async ({ page }) => {
    await page.goto("/offline");
    await expect(page.getByRole("heading", { name: /fuera de línea/ })).toBeVisible();
    await page.goto("/esta-ruta-no-existe");
    await expect(page.getByRole("heading", { name: /no existe/ })).toBeVisible();
  });

  test("health responde con base de datos", async ({ request }) => {
    const r = await request.get("/api/health");
    expect([200, 503]).toContain(r.status());
    const body = await r.json();
    expect(body.app).toBe("all-living");
  });

  test("el tabbar no tapa el contenido en 390", async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.includes("390"), "solo móvil");
    await page.goto("/welcome");
    const cta = page.getByRole("link", { name: "Comenzar" });
    const box = await cta.boundingBox();
    expect(box).not.toBeNull();
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(844);
  });
});
