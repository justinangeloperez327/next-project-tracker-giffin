import { test, expect, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";
test.setTimeout(60000);
async function register(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Register", exact: true }).click();
  await page.getByLabel("Full name").fill("Tracker Coordinator");
  await page
    .getByLabel("Email address")
    .fill(`tracker-${randomUUID()}@example.com`);
  await page
    .getByLabel("Password", { exact: true })
    .fill("Valid-tracker-password-24");
  await page.getByLabel("Confirm password").fill("Valid-tracker-password-24");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/dashboard/);
}
async function createProject(page: Page, category: string, name: string) {
  await page.goto("/projects");
  await page.getByRole("button", { name: "Add project", exact: true }).click();
  await page.getByLabel("SO No", { exact: true }).fill(`SO-${randomUUID()}`);
  await page.getByLabel("JO No", { exact: true }).fill(`JO-${randomUUID()}`);
  await page.getByLabel("Project name", { exact: true }).fill(name);
  await page.getByLabel("Client", { exact: true }).fill("GIFFIN client");
  await page.getByLabel("Contract price (AED)").fill("10000");
  await page.getByLabel("Category", { exact: true }).selectOption(category);
  await page
    .getByRole("button", { name: "Create project", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("Project created.");
  await page.getByRole("link", { name, exact: true }).click();
  await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
}
test("substation items save independently, retain dates after reload, and support clearing dates", async ({
  page,
  browser,
}) => {
  await register(page);
  await createProject(page, "Substation", "Substation Tracker Test");
  const doors = page.getByRole("group", { name: "Doors", exact: true });
  await doors
    .getByLabel("Site measurement date", { exact: true })
    .fill("2026-10-20");
  await doors
    .getByLabel("Drawing issued date", { exact: true })
    .fill("2026-10-22");
  await doors.getByLabel("Delivery date", { exact: true }).fill("2026-10-25");
  await doors
    .getByLabel("Installation date", { exact: true })
    .fill("2026-10-26");
  await doors.getByLabel("Remarks", { exact: true }).fill("Doors ready");
  await doors.getByRole("button", { name: "Save doors" }).click();
  await expect(doors.getByRole("status")).toHaveText("Doors tracker saved.");
  const beams = page.getByRole("group", {
    name: "Grating beam support",
    exact: true,
  });
  await beams
    .getByLabel("Remarks", { exact: true })
    .fill("Awaiting measurement");
  await beams
    .getByRole("button", { name: "Save grating beam support" })
    .click();
  await expect(beams.getByRole("status")).toHaveText(
    "Grating beam support tracker saved.",
  );
  const panels = page.getByRole("group", {
    name: "Grating panel",
    exact: true,
  });
  await panels.getByLabel("Delivery date", { exact: true }).fill("2026-11-02");
  await panels
    .getByRole("button", { name: "Save grating panel", exact: true })
    .click();
  await expect(panels.getByRole("status")).toHaveText(
    "Grating panel tracker saved.",
  );
  await page.reload();
  await expect(doors.getByLabel("Site measurement date")).toHaveValue(
    "2026-10-20",
  );
  await expect(doors.getByLabel("Installation date")).toHaveValue("2026-10-26");
  await expect(beams.getByLabel("Remarks")).toHaveValue("Awaiting measurement");
  await expect(panels.getByLabel("Delivery date")).toHaveValue("2026-11-02");
  await doors.getByLabel("Delivery date").fill("");
  await doors.getByRole("button", { name: "Save doors" }).click();
  await expect(doors.getByRole("status")).toBeVisible();
  await page.reload();
  await expect(doors.getByLabel("Delivery date")).toHaveValue("");
  const projectURL = page.url();
  const otherContext = await browser.newContext({
    baseURL: "http://127.0.0.1:3000",
  });
  const other = await otherContext.newPage();
  await register(other);
  await other.goto(projectURL);
  await expect(
    other.getByRole("heading", { name: "Page not found" }),
  ).toBeVisible();
  // A forged project ID must also be rejected at the mutation boundary.
  await createProject(other, "Substation", "Other Account Project");
  await other
    .locator('input[name="projectId"]')
    .first()
    .evaluate((input, id) => {
      (input as HTMLInputElement).value = id;
    }, projectURL.split("/").pop()!);
  const otherDoors = other.getByRole("group", { name: "Doors", exact: true });
  await otherDoors.getByLabel("Remarks").fill("Unauthorized change");
  await otherDoors.getByRole("button", { name: "Save doors" }).click();
  await expect(otherDoors.getByRole("alert")).toHaveText(
    "This substation project is unavailable.",
  );
  await page.reload();
  await expect(doors.getByLabel("Remarks")).toHaveValue("Doors ready");
  await otherContext.close();
});
test("bus shelter counts persist and reject installed counts above the total; other categories deferred", async ({
  page,
}) => {
  await register(page);
  await createProject(page, "Bus Shelters", "Shelter Tracker Test");
  await expect(page.getByText("No shelter counts recorded yet.")).toBeVisible();
  await page.getByLabel("Total shelters", { exact: true }).fill("6");
  await page.getByLabel("Installed shelters", { exact: true }).fill("2");
  await page.getByRole("button", { name: "Save shelter counts" }).click();
  await expect(page.getByRole("status")).toHaveText("Shelter counts saved.");
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuetext",
    "2 of 6 shelters installed",
  );
  await page.reload();
  await expect(page.getByLabel("Total shelters", { exact: true })).toHaveValue(
    "6",
  );
  await expect(
    page.getByLabel("Installed shelters", { exact: true }),
  ).toHaveValue("2");
  await page.getByLabel("Installed shelters", { exact: true }).fill("7");
  await page.getByRole("button", { name: "Save shelter counts" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "cannot exceed the total",
  );
  await page.reload();
  await expect(
    page.getByLabel("Installed shelters", { exact: true }),
  ).toHaveValue("2");
  await createProject(page, "Guardrail", "Guardrail Later");
  await expect(
    page.getByText("This category’s tracker will be added later.", {
      exact: false,
    }),
  ).toBeVisible();
  await createProject(page, "Handrail", "Handrail Later");
  await expect(
    page.getByText("This category’s tracker will be added later.", {
      exact: false,
    }),
  ).toBeVisible();
});
