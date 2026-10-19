import test from "node:test";
import assert from "node:assert/strict";
import {
  substationSchema,
  busShelterSchema,
  doorTypeIdentitySchema,
  doorTypeSchema,
} from "../lib/tracker-validation.ts";
const projectId = "93683de4-1277-4457-91db-549c0286f412";
const blank = {
  projectId,
  item: "Doors",
  site_measurement_date: "",
  drawing_issued_date: "",
  delivery_date: "",
  installation_date: "",
  remarks: "",
};
test("unknown dates remain null and remarks are trimmed", () => {
  assert.deepEqual(
    substationSchema.parse({ ...blank, remarks: "  Pending measurement  " }),
    {
      ...blank,
      site_measurement_date: null,
      drawing_issued_date: null,
      delivery_date: null,
      installation_date: null,
      remarks: "Pending measurement",
    },
  );
});
test("calendar dates accept leap days and reject invalid dates", () => {
  assert.equal(
    substationSchema.parse({ ...blank, delivery_date: "2028-02-29" })
      .delivery_date,
    "2028-02-29",
  );
  for (const date of [
    "2026-02-29",
    "2026-04-31",
    "2026-13-01",
    "not-a-date",
    "1899-01-01",
  ])
    assert.equal(
      substationSchema.safeParse({ ...blank, delivery_date: date }).success,
      false,
    );
});
test("all three substation items are accepted; other items and oversized remarks rejected", () => {
  for (const item of ["Doors", "Grating beam support", "Grating panel"])
    assert.equal(substationSchema.safeParse({ ...blank, item }).success, true);
  assert.equal(
    substationSchema.safeParse({ ...blank, item: "Guardrail" }).success,
    false,
  );
  assert.equal(
    substationSchema.safeParse({ ...blank, remarks: "x".repeat(4001) }).success,
    false,
  );
});
test("counts accept zero, partial and completed installation", () => {
  for (const [total, installed] of [
    ["0", "0"],
    ["6", "2"],
    ["6", "6"],
  ])
    assert.deepEqual(busShelterSchema.parse({ projectId, total, installed }), {
      projectId,
      total: Number(total),
      installed: Number(installed),
    });
});
test("counts reject blanks, negatives, decimals, excessive totals and installed above total", () => {
  for (const [total, installed] of [
    ["", "0"],
    ["-1", "0"],
    ["6", "2.5"],
    ["1000001", "0"],
    ["6", "7"],
  ])
    assert.equal(
      busShelterSchema.safeParse({ projectId, total, installed }).success,
      false,
    );
});
test("project identifiers are validated for each tracker", () => {
  assert.equal(
    substationSchema.safeParse({ ...blank, projectId: "invalid" }).success,
    false,
  );
  assert.equal(
    busShelterSchema.safeParse({
      projectId: "invalid",
      total: "6",
      installed: "1",
    }).success,
    false,
  );
});

test("door names are customizable, trimmed, and length validated", () => {
  assert.equal(
    doorTypeIdentitySchema.parse({ projectId, name: "  Double leaf steel  " })
      .name,
    "Double leaf steel",
  );
  for (const name of ["", "   ", "x".repeat(121)])
    assert.equal(
      doorTypeIdentitySchema.safeParse({ projectId, name }).success,
      false,
    );
});
test("door type dates validate independently of the name", () => {
  const data = { ...blank, id: projectId, name: "Fire door" };
  assert.equal(doorTypeSchema.safeParse(data).success, true);
  assert.equal(
    doorTypeSchema.safeParse({ ...data, delivery_date: "2026-02-30" }).success,
    false,
  );
});
