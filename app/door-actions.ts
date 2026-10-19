"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  doorTypeIdentitySchema,
  doorTypeSchema,
} from "@/lib/tracker-validation";
import { toDate } from "@/lib/tracker-dates";
import type { FormState } from "./actions";
export async function addDoorType(
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const parsed = doorTypeIdentitySchema.safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return { error: "Enter a door type name of 1–120 characters." };
  const d = parsed.data;
  try {
    const saved = await getDb().$transaction(async (tx) => {
      if (
        !(await tx.project.findFirst({
          where: { id: d.projectId, user_id: user.id, category: "Substation" },
          select: { id: true },
        }))
      )
        return false;
      await tx.doorTypeTracker.create({
        data: { project_id: d.projectId, name: d.name },
      });
      return true;
    });
    if (!saved) return { error: "This substation project is unavailable." };
  } catch {
    return {
      error:
        "Could not add this type. Use a different name if it already exists.",
    };
  }
  revalidatePath(`/projects/${d.projectId}`);
  return { success: "Door type added." };
}
export async function updateDoorType(
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const parsed = doorTypeSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return {
      error:
        "Check the door type name, dates and remarks (up to 4,000 characters).",
    };
  const d = parsed.data;
  try {
    const saved = await getDb().doorTypeTracker.updateMany({
      where: {
        id: d.id,
        project_id: d.projectId,
        project: { user_id: user.id, category: "Substation" },
      },
      data: {
        name: d.name,
        site_measurement_date: toDate(d.site_measurement_date),
        drawing_issued_date: toDate(d.drawing_issued_date),
        delivery_date: toDate(d.delivery_date),
        installation_date: toDate(d.installation_date),
        remarks: d.remarks,
      },
    });
    if (!saved.count) return { error: "This door type is unavailable." };
  } catch {
    return {
      error:
        "Could not save this type. Check whether another type already uses that name.",
    };
  }
  revalidatePath(`/projects/${d.projectId}`);
  return { success: "Door type saved." };
}
