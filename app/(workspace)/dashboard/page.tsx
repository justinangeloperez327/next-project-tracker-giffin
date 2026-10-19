import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getProjects } from "@/lib/projects";
import { categories, currency } from "@/lib/project-types";
import { Button } from "@/components/ui/button";
export default async function Dashboard() {
  const user = await requireUser();
  const projects = await getProjects(user.id);
  const total = projects.reduce((s, p) => s + Number(p.contract_price), 0);
  return (
    <>
      <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
        <div>
          <p className="eyebrow mb-3">Portfolio overview</p>
          <h1>Dashboard</h1>
          <p className="muted mt-2">A clear view of your project register.</p>
        </div>
        <Button asChild>
          <Link href="/projects">View projects</Link>
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {[
          ["Total projects", projects.length],
          ["Contract value", currency(total)],
          ["Clients", new Set(projects.map((p) => p.client)).size],
        ].map(([label, value]) => (
          <section className="panel p-6" key={label}>
            <p className="muted text-sm">{label}</p>
            <p className="data text-2xl mt-4 break-words">{value}</p>
          </section>
        ))}
      </div>
      <div className="grid lg:grid-cols-[1fr_1.3fr] gap-6">
        <section className="panel p-6">
          <h2>Projects by category</h2>
          <p className="muted text-sm mt-1 mb-6">
            Distribution across your register
          </p>
          {categories.map((c) => {
            const count = projects.filter((p) => p.category === c).length;
            return (
              <div key={c} className="mb-5">
                <div className="flex justify-between text-sm mb-2">
                  <span>{c}</span>
                  <span className="data">{count}</span>
                </div>
                <div className="h-2 bg-muted">
                  <div
                    className="h-2 bg-primary"
                    style={{
                      width: `${projects.length ? (count / projects.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </section>
        <section className="panel p-6">
          <h2>Recently added</h2>
          {projects.length ? (
            projects.slice(0, 5).map((p) => (
              <div
                key={p.id}
                className="border-b py-4 flex justify-between gap-4"
              >
                <div>
                  <p className="font-semibold">{p.project_name}</p>
                  <p className="muted text-xs data">
                    {p.so_no} / {p.jo_no}
                  </p>
                </div>
                <p className="text-sm data">{currency(p.contract_price)}</p>
              </div>
            ))
          ) : (
            <div className="py-12">
              <p>No projects yet.</p>
              <p className="muted text-sm mt-2">
                Add a project to build your portfolio overview.
              </p>
              <Button asChild className="mt-5">
                <Link href="/projects">Add your first project</Link>
              </Button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
