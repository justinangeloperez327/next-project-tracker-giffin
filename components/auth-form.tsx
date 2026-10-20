"use client";
import { useActionState, useState } from "react";
import { authenticate } from "@/app/actions";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
function Form({ mode }: { mode: "login" | "register" }) {
  const [state, action, pending] = useActionState(
    authenticate.bind(null, mode),
    {},
  );
  return (
    <form action={action} className="grid gap-5">
      {mode === "register" && (
        <label>
          Full name
          <Input
            name="name"
            autoComplete="name"
            minLength={2}
            maxLength={100}
            required
          />
        </label>
      )}
      <label>
        Email address
        <Input
          name="email"
          type="email"
          autoComplete="email"
          maxLength={254}
          required
        />
      </label>
      <label>
        Password
        <Input
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={12}
          maxLength={128}
          required
        />
      </label>
      {mode === "register" && (
        <>
          <p className="text-xs muted -mt-3">Use at least 12 characters.</p>
          <label>
            Confirm password
            <Input
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={12}
              required
            />
          </label>
        </>
      )}
      {state.error && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300">
          {state.error}
        </p>
      )}
      <Button disabled={pending}>
        {pending
          ? "Please wait…"
          : mode === "login"
            ? "Sign in"
            : "Create account"}
      </Button>
    </form>
  );
}
export function AuthForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  return (
    <section className="panel p-6 md:p-8 w-full max-w-md md:justify-self-end">
      <div
        className="auth-switch mb-7 grid grid-cols-2"
        role="group"
        aria-label="Account action"
      >
        <Button
          variant="ghost"
          aria-pressed={mode === "login"}
          onClick={() => setMode("login")}
        >
          Sign in
        </Button>
        <Button
          variant="ghost"
          aria-pressed={mode === "register"}
          onClick={() => setMode("register")}
        >
          Register
        </Button>
      </div>
      <h2 className="mb-2">
        {mode === "login" ? "Welcome back" : "Create your account"}
      </h2>
      <p className="muted text-sm mb-7">
        {mode === "login"
          ? "Sign in to your project workspace."
          : "Keep your project records in one place."}
      </p>
      <Form key={mode} mode={mode} />
    </section>
  );
}
