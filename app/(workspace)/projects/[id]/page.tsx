import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { currency } from "@/lib/project-types";
import { substationItems, type SubstationTracker } from "@/lib/tracker-types";
import {
  SubstationItemForm,
  BusShelterForm,
} from "@/components/project-trackers";
import { AddDoorType, DoorTypeForm } from "@/components/door-types";
import { dateInputs } from "@/lib/tracker-dates";
import { z } from "zod";
export default async function ProjectTracker({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const project = await getDb().project.findFirst({
    where: { id, user_id: user.id },
  });
  if (!project) notFound();
  const substation =
    project.category === "Substation"
      ? (
          await getDb().substationTracker.findMany({
            where: { project_id: id },
          })
        ).map(dateInputs)
      : [];
  const doorTypes =
    project.category === "Substation"
      ? (
          await getDb().doorTypeTracker.findMany({
            where: { project_id: id },
            orderBy: [{ name: "asc" }, { id: "asc" }],
          })
        ).map(dateInputs)
      : [];
  const shelters =
    project.category === "Bus Shelters"
      ? await getDb().busShelterTracker.findUnique({
          where: { project_id: id },
          select: { total: true, installed: true },
        })
      : null;
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
            ["Contract price", currency(project.contract_price.toFixed(2))],
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
          <section aria-labelledby="doors-heading" className="mb-8">
            <h2 id="doors-heading">Doors</h2>
            <p className="muted text-sm mt-2 mb-4">
              Add the door types used on this project. Each type has its own
              dates and remarks.
            </p>
            <AddDoorType projectId={id} />
            {doorTypes.length === 0 && (
              <p className="muted text-sm my-5">
                No door types yet. Add your first type above.
              </p>
            )}
            <div className="grid gap-5 mt-5">
              {doorTypes.map((tracker) => (
                <DoorTypeForm
                  key={tracker.id}
                  projectId={id}
                  tracker={tracker}
                />
              ))}
            </div>
          </section>
          <div className="grid gap-5">
            {substationItems
              .filter((item) => item !== "Doors")
              .map((item) => (
                <SubstationItemForm
                  key={item}
                  projectId={id}
                  tracker={
                    (substation.find((row) => row.item === item) as
                      SubstationTracker | undefined) ?? {
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
