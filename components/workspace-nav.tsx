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
      className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible"
    >
      {links.map(({ href, name, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={
            path === href || path.startsWith(href + "/") ? "page" : undefined
          }
          className="nav-link"
        >
          <Icon size={16} strokeWidth={1.6} aria-hidden="true" />
          {name}
        </Link>
      ))}
    </nav>
  );
}
