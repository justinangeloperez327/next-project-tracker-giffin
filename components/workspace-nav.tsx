"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Shapes,
  Settings,
  UserRound,
} from "lucide-react";
const links = [
  { href: "/dashboard", name: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", name: "Projects", icon: FolderKanban },
  { href: "/categories", name: "Categories", icon: Shapes },
  { href: "/settings", name: "Settings", icon: Settings },
  { href: "/profile", name: "Profile", icon: UserRound },
];
export function WorkspaceNav() {
  const path = usePathname();
  return (
    <nav
      aria-label="Workspace navigation"
      className="flex flex-wrap gap-1 md:flex-col"
    >
      {links.map(({ href, name, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={path === href ? "page" : undefined}
          className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm ${path === href ? "bg-muted font-semibold text-primary" : "hover:bg-muted"}`}
        >
          <Icon size={17} />
          {name}
        </Link>
      ))}
    </nav>
  );
}
