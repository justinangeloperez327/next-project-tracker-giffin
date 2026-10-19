import { ThemeToggle } from "@/components/theme";
export default function Settings() {
  return (
    <>
      <p className="eyebrow mb-3">Workspace preferences</p>
      <h1>Settings</h1>
      <section className="panel p-6 mt-8 max-w-2xl">
        <h2>Appearance</h2>
        <p className="muted mt-2 mb-5">
          Choose light or dark mode. Your preference is saved on this browser.
        </p>
        <ThemeToggle />
      </section>
      <section className="panel p-6 mt-5 max-w-2xl">
        <h2>Project defaults</h2>
        <p className="muted mt-2">
          Contract currency: AED · Category values are shared across the
          register.
        </p>
      </section>
    </>
  );
}
