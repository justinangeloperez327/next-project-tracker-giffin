import { PublicHeader } from "@/components/public-header";
import { AuthForm } from "@/components/auth-form";
export default function Home() {
  return (
    <>
      <PublicHeader />
      <main
        id="main"
        className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-14 md:min-h-[85vh] md:grid-cols-2 md:gap-24"
      >
        <section>
          <div className="eyebrow mb-6">GIFFIN / Project operations</div>
          <h1 className="max-w-lg text-5xl md:text-6xl">
            Every project.
            <br />A clearer picture.
          </h1>
          <p className="muted mt-6 max-w-md">
            Track contract values, clients, and project references in one
            focused workspace.
          </p>
          <div className="mt-10 border-l-4 border-primary pl-5">
            <p className="text-sm font-semibold">
              Built around your project register
            </p>
            <p className="muted text-sm">
              SO number · JO number · Contract value
            </p>
          </div>
          <div className="mt-10 flex flex-wrap gap-2">
            {["Substation", "Guardrail", "Handrail", "Bus Shelters"].map(
              (c) => (
                <span key={c} className="border px-3 py-2 text-xs">
                  {c}
                </span>
              ),
            )}
          </div>
        </section>
        <AuthForm />
      </main>
      <footer className="border-t px-6 py-5 text-xs muted">
        GIFFIN · Project Tracker
      </footer>
    </>
  );
}
