import { test, expect } from "@playwright/test";

/**
 * Flujos autenticados (owner elige semana, crea estancia, reserva servicio, cambia a proveedor, proveedor acepta).
 * Requieren un usuario de pruebas en Clerk: E2E_EMAIL + E2E_CODE (código fijo de test de Clerk, p. ej. 424242)
 * y NEXT_PUBLIC_APP_URL. Sin ellos, se saltan: nunca se simula una sesión.
 */
const EMAIL = process.env.E2E_EMAIL;
const CODE = process.env.E2E_CODE;

test.describe("Owner → estancia → servicio → proveedor", () => {
  test.skip(!EMAIL || !CODE, "Faltan E2E_EMAIL / E2E_CODE (usuario de pruebas de Clerk)");

  test.beforeEach(async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByLabel(/correo|email/i).fill(EMAIL!);
    await page.keyboard.press("Enter");
    await page.getByLabel(/código|code/i).fill(CODE!);
    await page.waitForURL(/\/(home|onboarding)/, { timeout: 20000 });
  });

  test("home saluda y muestra la próxima estancia o el demo", async ({ page }) => {
    await page.goto("/home");
    await expect(page.getByRole("heading", { name: /Hola,/ })).toBeVisible();
  });

  test("owner elige semana disponible y crea estancia", async ({ page }) => {
    await page.goto("/weeks");
    const usar = page.getByRole("link", { name: "Usar" }).first();
    test.skip(!(await usar.isVisible().catch(() => false)), "sin semana disponible");
    await usar.click();
    await page.getByLabel(/personas/i).fill("2");
    await page.getByRole("checkbox").last().check();
    await page.getByRole("button", { name: /Preparar estancia/ }).click();
    await page.waitForURL(/\/stays\/[0-9a-f-]+\/prepare/, { timeout: 15000 });
  });

  test("reserva un servicio", async ({ page }) => {
    await page.goto("/services/chefs");
    await page.getByRole("link").filter({ hasText: /Chef/ }).first().click();
    await page.getByRole("link", { name: "Solicitar" }).first().click();
    await page.getByRole("button", { name: /Solicitar reserva/ }).click();
    await page.waitForURL(/\/bookings\/[0-9a-f-]+/, { timeout: 15000 });
    await expect(page.getByText(/Pendiente|Solicitado/)).toBeVisible();
  });

  test("cambia a modo proveedor y ve su agenda", async ({ page }) => {
    await page.goto("/profile/mode");
    const prov = page.getByRole("button", { name: /Proveedor/ });
    test.skip(!(await prov.isVisible().catch(() => false)), "cuenta sin rol proveedor");
    await prov.click();
    await page.waitForURL(/\/pro/, { timeout: 15000 });
    await expect(page.getByRole("heading", { name: "Hoy" })).toBeVisible();
  });
});
