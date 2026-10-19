import { PublicHeader } from "@/components/public-header";
export default function Contact() {
  return (
    <>
      <PublicHeader />
      <main id="main" className="max-w-3xl mx-auto px-6 py-20">
        <p className="eyebrow mb-4">Contact us</p>
        <h1>Need help with your workspace?</h1>
        <p className="muted mt-6">
          Contact your GIFFIN project coordinator or workspace administrator for
          account access and project record questions.
        </p>
        <div className="panel p-6 mt-10">
          <h2>Support details</h2>
          <p className="muted mt-3">
            A shared support email and telephone number have not been configured
            yet. Use your existing internal contact channel.
          </p>
        </div>
      </main>
    </>
  );
}
