import { PublicHeader } from "@/components/public-header";
export default function About() {
  return (
    <>
      <PublicHeader />
      <main id="main" className="max-w-3xl mx-auto px-6 py-20">
        <p className="eyebrow mb-4">About the workspace</p>
        <h1>Project records, kept together.</h1>
        <p className="mt-6 muted">
          GIFFIN Project Tracker brings sales orders, job orders, clients, and
          contract values into a searchable project register. Organize work
          across Substation, Guardrail, Handrail, and Bus Shelters categories.
        </p>
        <section className="panel mt-10 p-6">
          <h2>One place to start each day</h2>
          <p className="muted mt-3">
            Review your portfolio on the dashboard, add project records, and
            keep your profile and appearance preferences up to date.
          </p>
        </section>
      </main>
    </>
  );
}
