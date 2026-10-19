import { getDb } from "./db";
import type { Project } from "./project-types";
export async function getProjects(userId: string): Promise<Project[]> {
  const rows = await getDb().project.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
  });
  return rows.map((row) => ({
    ...row,
    contract_price: row.contract_price.toFixed(2),
  }));
}
