import { z } from "zod";
import { substationItems } from "./tracker-types.ts";
// ISO calendar dates only; blank dates are deliberately allowed for work not scheduled yet.
const optionalDate = z
  .union([
    z.literal(""),
    z.iso
      .date()
      .refine(
        (value) => value >= "1900-01-01" && value <= "9999-12-31",
        "Enter a date from 1900 onward.",
      ),
  ])
  .transform((value) => value || null);
export const substationSchema = z.object({
  projectId: z.uuid(),
  item: z.enum(substationItems),
  site_measurement_date: optionalDate,
  drawing_issued_date: optionalDate,
  delivery_date: optionalDate,
  installation_date: optionalDate,
  remarks: z.string().trim().max(4000),
});
const quantity = z
  .string()
  .regex(/^\d{1,7}$/)
  .transform(Number)
  .pipe(z.number().int().min(0).max(1000000));
export const busShelterSchema = z
  .object({ projectId: z.uuid(), total: quantity, installed: quantity })
  .refine((data) => data.installed <= data.total, {
    message: "Installed shelters cannot exceed total shelters.",
    path: ["installed"],
  });

export const doorTypeIdentitySchema = z.object({
  projectId: z.uuid(),
  name: z.string().trim().min(1).max(120),
});
export const doorTypeSchema = substationSchema
  .omit({ item: true })
  .extend({ id: z.uuid(), name: z.string().trim().min(1).max(120) });
