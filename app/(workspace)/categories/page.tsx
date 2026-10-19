import { requireUser } from "@/lib/auth";
import { getProjects } from "@/lib/projects";
import { categories, currency } from "@/lib/project-types";
export default async function Categories() {
  const user = await requireUser();
  const projects = await getProjects(user.id);
  return (
    <>
      <p className="eyebrow mb-3">Project classification</p>
      <h1>Categories</h1>
      <p className="muted mt-2 mb-8">
        The four work categories used in your project register.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {categories.map((c) => {
          const rows = projects.filter((p) => p.category === c);
          return (
            <section key={c} className="panel p-6">
              <h2>{c}</h2>
              <p className="muted mt-4">{rows.length} projects</p>
              <p className="data mt-2">
                {currency(
                  rows.reduce((s, p) => s + Number(p.contract_price), 0),
                )}
              </p>
            </section>
          );
        })}
      </div>
    </>
  );
}
