import { requireUser } from "@/lib/auth";
import { ProfileForm } from "@/components/profile-form";
export default async function Profile() {
  const user = await requireUser();
  return (
    <>
      <p className="eyebrow mb-3">Your account</p>
      <h1>Profile</h1>
      <ProfileForm name={user.name} email={user.email} />
    </>
  );
}
