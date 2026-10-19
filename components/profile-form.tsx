"use client";
import { useActionState } from "react";
import { updateProfile } from "@/app/actions";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, action, pending] = useActionState(updateProfile, {});
  return (
    <form action={action} className="panel p-6 grid gap-5 mt-8 max-w-xl">
      <label>
        Full name
        <Input
          name="name"
          defaultValue={name}
          required
          minLength={2}
          maxLength={100}
        />
      </label>
      <label>
        Email address
        <Input type="email" value={email} readOnly />
      </label>
      <p className="muted text-xs">Your email is your account identifier.</p>
      {state.error && <p role="alert">{state.error}</p>}
      {state.success && <p role="status">{state.success}</p>}
      <Button disabled={pending}>{pending ? "Saving…" : "Save profile"}</Button>
    </form>
  );
}
