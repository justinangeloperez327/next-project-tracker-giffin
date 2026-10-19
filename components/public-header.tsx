import Link from "next/link";
import { ThemeToggle } from "./theme";
export function PublicHeader() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b px-5 py-4 md:px-10">
      <Link href="/" className="text-xl font-bold tracking-tight">
        GIFFIN{" "}
        <span className="ml-2 text-xs font-normal muted">PROJECT TRACKER</span>
      </Link>
      <nav
        aria-label="Public navigation"
        className="flex flex-wrap items-center gap-5 text-sm"
      >
        <Link href="/about">About</Link>
        <Link href="/contact">Contact us</Link>
        <ThemeToggle />
      </nav>
    </header>
  );
}
