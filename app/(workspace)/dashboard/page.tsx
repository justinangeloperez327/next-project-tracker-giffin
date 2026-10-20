import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getProjects } from "@/lib/projects";
import { categories, currency } from "@/lib/project-types";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, FolderOpen } from "lucide-react";
export default async function Dashboard() {
  const user = await requireUser();
  const projects = await getProjects(user.id);
  const total = projects.reduce((s, p) => s + Number(p.contract_price), 0);
  return (
    <>
      <div className="flex flex-wrap justify-between items-end gap-4 mb-7">
        <div>
          <p className="eyebrow mb-2">Overview</p>
          <h1>Dashboard</h1>
          <p className="muted mt-2 text-sm">Your projects, at a glance.</p>
        </div>
        <Button asChild>
          <Link href="/projects">
            View projects
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </Button>
      </div>
      <section
        aria-label="Project summary"
        className="panel grid sm:grid-cols-3 mb-7"
      >
        {[
          ["Total projects", projects.length],
          ["Contract value", currency(total)],
          ["Clients", new Set(projects.map((p) => p.client)).size],
        ].map(([label, value]) => (
          <div className="summary-cell" key={label}>
            <p className="muted text-xs">{label}</p>
            <p className="text-[25px] tracking-tight font-medium mt-2 break-words tabular-nums">
              {value}
            </p>
          </div>
        ))}
      </section>
      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-5">
        <section className="panel p-5 md:p-6">
          <h2>Projects by category</h2>
          <p className="muted text-xs mt-1 mb-6">
            Across your project register
          </p>
          {categories.map((c) => {
            const count = projects.filter((p) => p.category === c).length;
            return (
              <div key={c} className="mb-5 last:mb-0">
                <div className="flex justify-between text-[13px] mb-2">
                  <span>{c}</span>
                  <span className="muted tabular-nums">{count}</span>
                </div>
                <div className="h-1 bg-muted">
                  <div
                    className="h-1 bg-primary/70"
                    style={{
                      width: `${projects.length ? (count / projects.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </section>
        <section className="panel p-5 md:p-6">
          <div className="flex justify-between gap-4 items-center">
            <h2>Recently added</h2>
            <span className="text-[11px] muted">Latest projects</span>
          </div>
          {projects.length ? (
            <div className="mt-3">
              {projects.slice(0, 5).map((p) => (
                <Link
                  href={`/projects/${p.id}`}
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-b last:border-0 py-4 hover:text-primary"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-[13px]">{p.project_name}</p>
                    <p className="muted text-[11px] data mt-1">
                      {p.so_no} / {p.jo_no}
                    </p>
                  </div>
                  <p className="text-xs tabular-nums">
                    {currency(p.contract_price)}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <FolderOpen
                size={24}
                strokeWidth={1.3}
                className="mx-auto text-primary mb-4"
                aria-hidden="true"
              />
              <p className="text-sm font-medium">No projects yet.</p>
              <p className="muted text-xs mt-2">
                Start with a project. Its tracker will be ready when you are.
              </p>
              <Button asChild variant="outline" className="mt-5">
                <Link href="/projects">Add your first project</Link>
              </Button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
