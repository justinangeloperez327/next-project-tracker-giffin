"use client";
import { ThemeProvider, useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <Button
      variant="outline"
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle color theme"
    >
      {mounted && resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
    </Button>
  );
}
