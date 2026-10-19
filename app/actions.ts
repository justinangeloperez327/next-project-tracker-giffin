"use server";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  createSession,
  hashPassword,
  verifyPassword,
  requireUser,
  digest,
} from "@/lib/auth";
export type FormState = { error?: string; success?: string };
const credentials = z.object({
  email: z.email().max(254),
  password: z.string().min(12).max(128),
});
export async function authenticate(
  mode: "login" | "register",
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  const parsed = credentials.safeParse({
    email: String(form.get("email")).trim().toLowerCase(),
    password: form.get("password"),
  });
  if (!parsed.success)
    return {
      error: "Enter a valid email and a password of 12–128 characters.",
    };
  const { email, password } = parsed.data;
  let id: string;
  try {
    const limit = await db.query(
      "INSERT INTO auth_attempts VALUES($1,1,now()) ON CONFLICT(email) DO UPDATE SET attempts=CASE WHEN auth_attempts.window_start < now()-interval '15 minutes' THEN 1 ELSE auth_attempts.attempts+1 END, window_start=CASE WHEN auth_attempts.window_start < now()-interval '15 minutes' THEN now() ELSE auth_attempts.window_start END RETURNING attempts",
      [email],
    );
    if (limit.rows[0].attempts > 10)
      return { error: "Too many attempts. Try again in 15 minutes." };
    if (mode === "register") {
      const name = String(form.get("name") ?? "").trim();
      if (name.length < 2 || name.length > 100)
        return { error: "Enter a name between 2 and 100 characters." };
      if (password !== form.get("confirmPassword"))
        return { error: "Passwords do not match." };
      id = randomUUID();
      const result = await db.query(
        "INSERT INTO users(id,name,email,password_hash) VALUES($1,$2,$3,$4) ON CONFLICT(email) DO NOTHING RETURNING id",
        [id, name, email, hashPassword(password)],
      );
      if (!result.rowCount)
        return { error: "Unable to create account. Try signing in instead." };
    } else {
      const result = await db.query(
        "SELECT id,password_hash FROM users WHERE email=$1",
        [email],
      );
      const valid = verifyPassword(
        password,
        result.rows[0]?.password_hash ?? hashPassword("dummy-password-value"),
      );
      if (!result.rows[0] || !valid)
        return { error: "Email or password is incorrect." };
      id = result.rows[0].id;
    }
    await createSession(id);
    await db.query("DELETE FROM auth_attempts WHERE email=$1", [email]);
  } catch {
    return {
      error:
        "Unable to connect. Please try again or contact your administrator.",
    };
  }
  redirect("/dashboard");
}
export async function logout() {
  const cookieStore = await cookies();
  const token = cookieStore.get("giffin_session")?.value;
  if (token)
    await db.query("DELETE FROM sessions WHERE token_hash=$1", [digest(token)]);
  cookieStore.delete("giffin_session");
  redirect("/");
}
export async function saveProject(
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const schema = z.object({
    so: z.string().trim().min(1).max(80),
    jo: z.string().trim().min(1).max(80),
    name: z.string().trim().min(1).max(200),
    client: z.string().trim().min(1).max(200),
    price: z.string().regex(/^\d{1,14}(\.\d{1,2})?$/),
    category: z.enum(["Substation", "Guardrail", "Handrail", "Bus Shelters"]),
  });
  const data = schema.safeParse(Object.fromEntries(form));
  if (!data.success)
    return {
      error:
        "Complete every field and enter a valid contract price with up to two decimals.",
    };
  const p = data.data;
  try {
    await db.query(
      "INSERT INTO projects VALUES($1,$2,$3,$4,$5,$6,$7,$8,now())",
      [
        randomUUID(),
        user.id,
        p.so,
        p.jo,
        p.name,
        p.client,
        p.price,
        p.category,
      ],
    );
  } catch {
    return {
      error:
        "Could not save. Check whether this SO and JO combination already exists.",
    };
  }
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  return { success: "Project created." };
}
export async function updateProfile(
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const name = String(form.get("name") ?? "").trim();
  if (name.length < 2 || name.length > 100)
    return { error: "Enter a name between 2 and 100 characters." };
  await db.query("UPDATE users SET name=$1 WHERE id=$2", [name, user.id]);
  revalidatePath("/profile");
  return { success: "Profile updated." };
}
