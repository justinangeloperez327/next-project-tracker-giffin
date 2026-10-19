"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { substationSchema, busShelterSchema } from "@/lib/tracker-validation";
import { toDate } from "@/lib/tracker-dates";
import type { FormState } from "./actions";
export async function saveSubstationTracker(
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const result = substationSchema.safeParse(Object.fromEntries(form));
  if (!result.success)
    return {
      error: "Check the dates and keep remarks within 4,000 characters.",
    };
  const d = result.data;
  if (d.item === "Doors")
    return { error: "Use the named door types to track doors." };
  try {
    const saved = await getDb().$transaction(async (tx) => {
      if (
        !(await tx.project.findFirst({
          where: { id: d.projectId, user_id: user.id, category: "Substation" },
          select: { id: true },
        }))
      )
        return false;
      const data = {
        site_measurement_date: toDate(d.site_measurement_date),
        drawing_issued_date: toDate(d.drawing_issued_date),
        delivery_date: toDate(d.delivery_date),
        installation_date: toDate(d.installation_date),
        remarks: d.remarks,
      };
      await tx.substationTracker.upsert({
        where: { project_id_item: { project_id: d.projectId, item: d.item } },
        create: { project_id: d.projectId, item: d.item, ...data },
        update: data,
      });
      return true;
    });
    if (!saved) return { error: "This substation project is unavailable." };
  } catch {
    return { error: "Could not save the tracker. Please try again." };
  }
  revalidatePath(`/projects/${d.projectId}`);
  return { success: `${d.item} tracker saved.` };
}
export async function saveBusShelterTracker(
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const result = busShelterSchema.safeParse(Object.fromEntries(form));
  if (!result.success)
    return {
      error:
        "Enter whole numbers from 0 to 1,000,000. Installed shelters cannot exceed the total.",
    };
  const d = result.data;
  try {
    const saved = await getDb().$transaction(async (tx) => {
      if (
        !(await tx.project.findFirst({
          where: {
            id: d.projectId,
            user_id: user.id,
            category: "Bus Shelters",
          },
          select: { id: true },
        }))
      )
        return false;
      await tx.busShelterTracker.upsert({
        where: { project_id: d.projectId },
        create: {
          project_id: d.projectId,
          total: d.total,
          installed: d.installed,
        },
        update: { total: d.total, installed: d.installed },
      });
      return true;
    });
    if (!saved) return { error: "This bus shelter project is unavailable." };
  } catch {
    return { error: "Could not save the shelter counts. Please try again." };
  }
  revalidatePath(`/projects/${d.projectId}`);
  return { success: "Shelter counts saved." };
}
