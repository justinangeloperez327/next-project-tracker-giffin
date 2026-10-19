import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="p-10">
      <h1>Page not found</h1>
      <Link href="/" className="block mt-6 underline">
        Return to homepage
      </Link>
    </main>
  );
}
