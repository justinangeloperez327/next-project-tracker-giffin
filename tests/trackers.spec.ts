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
  await page.getByLabel("New door type").fill("Doors");
  await page
    .getByRole("button", { name: "Add door type", exact: true })
    .click();
  const doors = page.getByRole("group", { name: "Doors", exact: true });
  await expect(doors).toBeVisible();
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
  await doors.getByRole("button", { name: "Save door type" }).click();
  await expect(doors.getByRole("status")).toHaveText("Door type saved.");
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
  await doors.getByRole("button", { name: "Save door type" }).click();
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
  const otherBeams = other.getByRole("group", {
    name: "Grating beam support",
    exact: true,
  });
  // Alter the submitted payload: React can restore controlled hidden inputs.
  const forgedForm = otherBeams.locator("..");
  await forgedForm.evaluate((form, id) => {
    form.addEventListener("formdata", (event) => {
      (event as FormDataEvent).formData.set("projectId", id);
      form.setAttribute("data-forged", "true");
    });
  }, projectURL.split("/").pop()!);
  await otherBeams.getByLabel("Remarks").fill("Unauthorized change");
  await otherBeams
    .getByRole("button", { name: "Save grating beam support" })
    .click();
  await expect(forgedForm).toHaveAttribute("data-forged", "true");
  await expect(otherBeams.getByRole("alert")).toHaveText(
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
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
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

test("door types can be added, renamed and tracked independently", async ({
  page,
}) => {
  await register(page);
  await createProject(page, "Substation", "Custom Door Types");
  for (const name of ["Steel door", "Fire door", "Aluminium door"]) {
    await page.getByLabel("New door type").fill(name);
    await page
      .getByRole("button", { name: "Add door type", exact: true })
      .click();
    await expect(page.getByRole("group", { name, exact: true })).toBeVisible();
  }
  const steel = page.getByRole("group", { name: "Steel door", exact: true });
  await steel.getByLabel("Delivery date").fill("2026-11-03");
  await steel.getByLabel("Door type name").fill("Double leaf steel door");
  await steel
    .getByRole("button", { name: "Save door type", exact: true })
    .click();
  await expect(
    page.getByRole("group", { name: "Double leaf steel door", exact: true }),
  ).toBeVisible();
  const fire = page.getByRole("group", { name: "Fire door", exact: true });
  await fire.getByLabel("Remarks").fill("Awaiting drawing");
  await fire
    .getByRole("button", { name: "Save door type", exact: true })
    .click();
  await expect(fire.getByRole("status")).toHaveText("Door type saved.");
  await page.reload();
  await expect(
    page
      .getByRole("group", { name: "Double leaf steel door", exact: true })
      .getByLabel("Delivery date"),
  ).toHaveValue("2026-11-03");
  await expect(fire.getByLabel("Delivery date")).toHaveValue("");
  await expect(fire.getByLabel("Remarks")).toHaveValue("Awaiting drawing");
  await expect(
    page.getByRole("group", { name: "Aluminium door", exact: true }),
  ).toBeVisible();
  await page.getByLabel("New door type").fill(" FIRE DOOR ");
  await page
    .getByRole("button", { name: "Add door type", exact: true })
    .click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("already exists");
});
