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
    <div className="min-h-screen md:grid md:grid-cols-[220px_1fr]">
      <aside className="border-b md:border-r bg-[var(--surface)] p-4">
        <Link href="/dashboard" className="block px-3 pt-3 pb-7">
          <strong className="text-2xl tracking-tight">GIFFIN</strong>
          <span className="eyebrow block mt-1">Project Tracker</span>
        </Link>
        <WorkspaceNav />
        <p className="hidden md:block mt-10 px-3 text-xs muted">
          Project operations
          <br />
          Your register. In focus.
        </p>
      </aside>
      <div className="min-w-0">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3">
          <span className="text-sm muted">
            Workspace / <span className="text-foreground">{user.name}</span>
          </span>
          <div className="flex gap-2">
            <ThemeToggle />
            <form action={logout}>
              <Button variant="ghost">Sign out</Button>
            </form>
          </div>
        </header>
        <main id="main" className="p-5 md:p-9 max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
