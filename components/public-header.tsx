import Link from "next/link";
import { ThemeToggle } from "./theme";
export function PublicHeader() {
  return (
    <header className="border-b bg-[var(--surface)]">
      <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-3 px-5 md:px-8 py-3">
        <Link href="/" className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid h-8 w-8 place-items-center rounded border border-primary/30 text-primary text-sm font-semibold"
          >
            G
          </span>
          <span className="text-sm font-semibold tracking-[.07em]">
            GIFFIN
            <span className="block mt-0.5 text-[10px] font-normal tracking-normal muted">
              Project tracker
            </span>
          </span>
        </Link>
        <nav
          aria-label="Public navigation"
          className="flex items-center gap-4 sm:gap-6 text-xs"
        >
          <Link href="/about" className="py-3 hover:text-primary">
            About
          </Link>
          <Link href="/contact" className="py-3 hover:text-primary">
            Contact us
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
