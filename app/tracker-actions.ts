"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { substationSchema, busShelterSchema } from "@/lib/tracker-validation";
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
  try {
    const saved = await db.query(
      `INSERT INTO substation_trackers(project_id,item,site_measurement_date,drawing_issued_date,delivery_date,installation_date,remarks)
      SELECT id,$3,$4::date,$5::date,$6::date,$7::date,$8 FROM projects WHERE id=$1 AND user_id=$2 AND category='Substation'
      ON CONFLICT(project_id,item) DO UPDATE SET site_measurement_date=EXCLUDED.site_measurement_date,drawing_issued_date=EXCLUDED.drawing_issued_date,delivery_date=EXCLUDED.delivery_date,installation_date=EXCLUDED.installation_date,remarks=EXCLUDED.remarks RETURNING project_id`,
      [
        d.projectId,
        user.id,
        d.item,
        d.site_measurement_date,
        d.drawing_issued_date,
        d.delivery_date,
        d.installation_date,
        d.remarks,
      ],
    );
    if (!saved.rowCount)
      return { error: "This substation project is unavailable." };
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
    const saved = await db.query(
      `INSERT INTO bus_shelter_trackers(project_id,total,installed)
      SELECT id,$3,$4 FROM projects WHERE id=$1 AND user_id=$2 AND category='Bus Shelters'
      ON CONFLICT(project_id) DO UPDATE SET total=EXCLUDED.total,installed=EXCLUDED.installed RETURNING project_id`,
      [d.projectId, user.id, d.total, d.installed],
    );
    if (!saved.rowCount)
      return { error: "This bus shelter project is unavailable." };
  } catch {
    return { error: "Could not save the shelter counts. Please try again." };
  }
  revalidatePath(`/projects/${d.projectId}`);
  return { success: "Shelter counts saved." };
}
