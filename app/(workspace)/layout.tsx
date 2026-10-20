import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { WorkspaceNav } from "@/components/workspace-nav";
import { ThemeToggle } from "@/components/theme";
import { logout } from "@/app/actions";
import { Button } from "@/components/ui/button";
export const dynamic = "force-dynamic";
export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  return (
    <div className="min-h-screen md:grid md:grid-cols-[208px_minmax(0,1fr)]">
      <aside className="workspace-sidebar border-b md:border-b-0 md:border-r px-3 py-3 md:sticky md:top-0 md:h-screen md:flex md:flex-col">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-4 mb-2 md:mb-8"
        >
          <span
            aria-hidden="true"
            className="grid h-8 w-8 place-items-center border border-primary/30 rounded bg-[var(--surface)] text-primary text-sm font-semibold"
          >
            G
          </span>
          <span>
            <strong className="block text-sm tracking-[.08em] font-semibold">
              GIFFIN
            </strong>
            <span className="block text-[11px] muted mt-0.5">
              Project tracker
            </span>
          </span>
        </Link>
        <WorkspaceNav />
        <div className="hidden md:block mt-auto border-t px-3 pt-5 pb-2">
          <p className="text-xs font-medium">GIFFIN workspace</p>
          <p className="text-[11px] muted mt-1">Projects &amp; site progress</p>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="flex items-center justify-between gap-3 border-b px-5 md:px-9 py-3 bg-[var(--surface)]">
          <span className="text-xs muted">Project workspace</span>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-xs muted mr-3 max-w-48 truncate">
              {user.name}
            </span>
            <ThemeToggle />
            <form action={logout}>
              <Button variant="ghost">Sign out</Button>
            </form>
          </div>
        </header>
        <main id="main" className="p-5 md:px-9 md:py-8 max-w-[1400px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
