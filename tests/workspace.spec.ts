import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
test("public pages, theme, and protected workspace", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible();
  await test
    .info()
    .attach("Homepage", {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png",
    });
  await page.getByRole("link", { name: "About", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Project records, kept together." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Contact us" }).click();
  await expect(
    page.getByRole("heading", { name: "Need help with your workspace?" }),
  ).toBeVisible();
  const before = await page.locator("html").getAttribute("class");
  await page.getByRole("button", { name: "Toggle color theme" }).click();
  await expect
    .poll(() => page.locator("html").getAttribute("class"))
    .not.toBe(before);
  await page.goto("/projects");
  await expect(page).toHaveURL(/\/$/);
});
test("register, create and filter project, update profile, logout, login and isolate accounts", async ({
  page,
  browser,
}) => {
  const email = `test-${randomUUID()}@example.com`;
  const password = "Valid-test-password-24";
  await page.goto("/");
  await page.getByRole("button", { name: "Register", exact: true }).click();
  await page.getByLabel("Full name").fill("Project Coordinator");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password").fill(password);
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page).toHaveURL(/dashboard/);
  await test
    .info()
    .attach("Dashboard", {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png",
    });
  await page.getByRole("link", { name: "Projects", exact: true }).click();
  await page.getByRole("button", { name: "Add project", exact: true }).click();
  await page.getByLabel("SO No", { exact: true }).fill("SO-2026-1");
  await page.getByLabel("JO No", { exact: true }).fill("JO-2026-1");
  await page
    .getByLabel("Project name", { exact: true })
    .fill("Abu Dhabi Shelter");
  await page.getByLabel("Client", { exact: true }).fill("Test client");
  await page.getByLabel("Contract price (AED)").fill("125000.50");
  await page
    .getByLabel("Category", { exact: true })
    .selectOption("Bus Shelters");
  await page.getByRole("button", { name: "Create project" }).click();
  await expect(page.getByRole("status")).toHaveText("Project created.");
  await expect(
    page.getByRole("cell", { name: "Abu Dhabi Shelter", exact: true }),
  ).toBeVisible();
  await test
    .info()
    .attach("Project register", {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png",
    });
  await page.getByLabel("Filter category").selectOption("Handrail");
  await expect(
    page.getByRole("heading", { name: "No matching projects" }),
  ).toBeVisible();
  await page.getByLabel("Filter category").selectOption("");
  await page.getByRole("link", { name: "Profile", exact: true }).click();
  await page.getByLabel("Full name").fill("Updated Coordinator");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByRole("status")).toHaveText("Profile updated.");
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page
    .getByRole("button", { name: "Sign in", exact: true })
    .last()
    .click();
  await expect(page).toHaveURL(/dashboard/);
  const context = await browser.newContext({
    baseURL: "http://127.0.0.1:3000",
  });
  const other = await context.newPage();
  await other.goto("/");
  await other.getByRole("button", { name: "Register", exact: true }).click();
  await other.getByLabel("Full name").fill("Other User");
  await other
    .getByLabel("Email address")
    .fill(`other-${randomUUID()}@example.com`);
  await other.getByLabel("Password", { exact: true }).fill(password);
  await other.getByLabel("Confirm password").fill(password);
  await other.getByRole("button", { name: "Create account" }).click();
  await expect(other).toHaveURL(/dashboard/);
  await other.goto("/projects");
  await expect(
    other.getByRole("cell", { name: "Abu Dhabi Shelter" }),
  ).toHaveCount(0);
  await context.close();
});
