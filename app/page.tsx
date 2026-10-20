import { PublicHeader } from "@/components/public-header";
import { AuthForm } from "@/components/auth-form";
import { Check } from "lucide-react";
export default function Home() {
  return (
    <>
      <PublicHeader />
      <main
        id="main"
        className="mx-auto grid max-w-5xl items-center gap-10 px-5 py-10 md:min-h-[calc(100svh-136px)] md:grid-cols-2 md:gap-20 md:px-8 md:py-16"
      >
        <section className="max-w-md">
          <p className="eyebrow mb-5">Projects &amp; site progress</p>
          <h1 className="text-3xl md:text-[38px] leading-[1.2]">
            A little more clarity.
            <br />
            Every working day.
          </h1>
          <p className="muted mt-5 max-w-sm text-sm">
            One place for your project references, contract values, and progress
            on site.
          </p>
          <ul className="mt-8 grid gap-4 text-sm">
            {[
              "Keep SO and JO references together",
              "Track dates for each door type",
              "See how many shelters are installed",
            ].map((text) => (
              <li key={text} className="flex gap-3 items-center">
                <Check
                  size={15}
                  className="text-primary shrink-0"
                  aria-hidden="true"
                />
                {text}
              </li>
            ))}
          </ul>
          <p className="border-t pt-5 mt-8 text-xs muted leading-6">
            Substation · Bus Shelters · Guardrail · Handrail
          </p>
        </section>
        <AuthForm />
      </main>
      <footer className="mx-auto max-w-6xl px-5 md:px-8 py-5 text-[11px] muted">
        GIFFIN / Project workspace
      </footer>
    </>
  );
}
