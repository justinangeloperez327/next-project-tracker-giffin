"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="p-10">
      <h1>Workspace unavailable</h1>
      <p className="my-5 muted">
        Please try again. If this continues, ask your administrator to check the
        database connection.
      </p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
