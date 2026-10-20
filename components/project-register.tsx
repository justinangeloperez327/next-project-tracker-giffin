"use client";
import Link from "next/link";
import { useState, useActionState, useRef, useEffect } from "react";
import { saveProject } from "@/app/actions";
import { categories, currency, type Project } from "@/lib/project-types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
export function ProjectRegister({ projects }: { projects: Project[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(saveProject, {});
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.success) form.current?.reset();
  }, [state]);
  const rows = projects.filter(
    (p) =>
      (!category || p.category === category) &&
      [p.so_no, p.jo_no, p.project_name, p.client].some((v) =>
        v.toLowerCase().includes(search.toLowerCase()),
      ),
  );
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="eyebrow mb-3">Project register</p>
          <h1>Projects</h1>
          <p className="muted mt-2 text-sm">
            References, clients, and contract values in one place.
          </p>
        </div>
        <Button onClick={() => setOpen(!open)} aria-expanded={open}>
          {open ? "Close form" : "Add project"}
        </Button>
      </div>
      {open && (
        <form ref={form} action={action} className="panel p-6 mb-6">
          <h2 className="mb-5">New project</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["so", "SO No"],
              ["jo", "JO No"],
              ["name", "Project name"],
              ["client", "Client"],
            ].map(([name, label]) => (
              <label key={name}>
                {label}
                <Input
                  name={name}
                  required
                  maxLength={name === "so" || name === "jo" ? 80 : 200}
                />
              </label>
            ))}
            <label>
              Contract price (AED)
              <Input
                name="price"
                type="number"
                min="0"
                max="99999999999999.99"
                step="0.01"
                required
              />
            </label>
            <div className="grid gap-2">
              <label htmlFor="project-category">Category</label>
              <select id="project-category" name="category" required>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          {state.error && (
            <p role="alert" className="mt-4 text-red-700 dark:text-red-300">
              {state.error}
            </p>
          )}
          {state.success && (
            <p role="status" className="mt-4">
              {state.success}
            </p>
          )}
          <Button className="mt-5" disabled={pending}>
            {pending ? "Saving…" : "Create project"}
          </Button>
        </form>
      )}
      <section className="panel overflow-hidden">
        <div className="flex flex-wrap gap-3 p-4 border-b">
          <label className="flex-1 min-w-48">
            <span className="sr-only">Search projects</span>
            <Input
              placeholder="Search SO, JO, project or client…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <label>
            <span className="sr-only">Filter category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
        <div
          className="overflow-x-auto"
          tabIndex={0}
          role="region"
          aria-label="Project register table"
        >
          <table className="w-full">
            <thead>
              <tr>
                {[
                  "SO No",
                  "JO No",
                  "Project name",
                  "Client",
                  "Contract price",
                  "Category",
                ].map((c) => (
                  <th
                    key={c}
                    className={c === "Contract price" ? "text-right" : ""}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td className="data">{p.so_no}</td>
                  <td className="data">{p.jo_no}</td>
                  <td className="font-medium">
                    <Link
                      href={`/projects/${p.id}`}
                      className="hover:text-primary hover:underline underline-offset-4"
                    >
                      {p.project_name}
                    </Link>
                  </td>
                  <td>{p.client}</td>
                  <td className="text-right data">
                    {currency(p.contract_price)}
                  </td>
                  <td>
                    <span className="text-xs muted">{p.category}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="text-center px-6 py-16">
              <h2>
                {projects.length
                  ? "No matching projects"
                  : "Start your project register"}
              </h2>
              <p className="muted mt-2 text-sm">
                {projects.length
                  ? "Try another search or category."
                  : "Add your first project to track its references and contract value."}
              </p>
            </div>
          )}
        </div>
        <div className="p-4 text-xs muted">
          {rows.length} of {projects.length} projects · Values in AED
        </div>
      </section>
    </>
  );
}
