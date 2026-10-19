import { db } from "./db";
import type { Project } from "./project-types";
export async function getProjects(userId: string): Promise<Project[]> {
  return (
    await db.query(
      "SELECT * FROM projects WHERE user_id=$1 ORDER BY created_at DESC",
      [userId],
    )
  ).rows;
}
