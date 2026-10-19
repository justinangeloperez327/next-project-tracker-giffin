import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { currency, type Project } from "@/lib/project-types";
import {
  substationItems,
  type SubstationTracker,
  type BusShelterTracker,
} from "@/lib/tracker-types";
import {
  SubstationItemForm,
  BusShelterForm,
} from "@/components/project-trackers";
import { z } from "zod";
export default async function ProjectTracker({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const project = (
    await db.query<Project>(
      "SELECT * FROM projects WHERE id=$1 AND user_id=$2",
      [id, user.id],
    )
  ).rows[0];
  if (!project) notFound();
  let substation: SubstationTracker[] = [];
  let shelters: BusShelterTracker | null = null;
  if (project.category === "Substation")
    substation = (
      await db.query<SubstationTracker>(
        `SELECT item,to_char(site_measurement_date,'YYYY-MM-DD') AS site_measurement_date,to_char(drawing_issued_date,'YYYY-MM-DD') AS drawing_issued_date,to_char(delivery_date,'YYYY-MM-DD') AS delivery_date,to_char(installation_date,'YYYY-MM-DD') AS installation_date,remarks FROM substation_trackers WHERE project_id=$1`,
        [id],
      )
    ).rows;
  if (project.category === "Bus Shelters")
    shelters =
      (
        await db.query<BusShelterTracker>(
          "SELECT total,installed FROM bus_shelter_trackers WHERE project_id=$1",
          [id],
        )
      ).rows[0] ?? null;
  return (
    <>
      <Link
        href="/projects"
        className="text-sm text-primary underline underline-offset-4"
      >
        Back to projects
      </Link>
      <header className="mt-6 mb-8">
        <p className="eyebrow mb-3">{project.category} / Project tracker</p>
        <h1>{project.project_name}</h1>
        <dl className="flex flex-wrap gap-x-8 gap-y-4 mt-5 text-sm">
          {[
            ["SO No", project.so_no],
            ["JO No", project.jo_no],
            ["Client", project.client],
            ["Contract price", currency(project.contract_price)],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="muted text-xs mb-1">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </header>
      {project.category === "Substation" ? (
        <>
          <h2>Substation tracker</h2>
          <p className="muted text-sm mt-2 mb-6">
            Record each item’s dates and remarks. Leave dates blank until they
            are known.
          </p>
          <div className="grid gap-5">
            {substationItems.map((item) => (
              <SubstationItemForm
                key={item}
                projectId={id}
                tracker={
                  substation.find((row) => row.item === item) ?? {
                    item,
                    site_measurement_date: null,
                    drawing_issued_date: null,
                    delivery_date: null,
                    installation_date: null,
                    remarks: "",
                  }
                }
              />
            ))}
          </div>
        </>
      ) : project.category === "Bus Shelters" ? (
        <BusShelterForm projectId={id} tracker={shelters} />
      ) : (
        <section className="panel p-6">
          <h2>{project.category} tracker</h2>
          <p className="muted mt-2">
            This category’s tracker will be added later. Your project details
            are saved in the register.
          </p>
        </section>
      )}
    </>
  );
}
