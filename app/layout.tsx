import type { Metadata } from "next";
import { Providers } from "@/components/theme";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "GIFFIN | Project Tracker", template: "%s | GIFFIN" },
  description:
    "A focused workspace for GIFFIN project contracts and references.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <a href="#main" className="sr-only focus:not-sr-only">
            Skip to content
          </a>
          {children}
        </Providers>
      </body>
    </html>
  );
}
