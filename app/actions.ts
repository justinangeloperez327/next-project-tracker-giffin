"use server";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/lib/db";
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
    const db = getDb();
    // A single atomic, parameterized statement avoids a read/increment race.
    const limit = await db.$queryRaw<
      Array<{ attempts: number }>
    >`INSERT INTO auth_attempts VALUES(${email},1,now()) ON CONFLICT(email) DO UPDATE SET attempts=CASE WHEN auth_attempts.window_start < now()-interval '15 minutes' THEN 1 ELSE auth_attempts.attempts+1 END, window_start=CASE WHEN auth_attempts.window_start < now()-interval '15 minutes' THEN now() ELSE auth_attempts.window_start END RETURNING attempts`;
    if (limit[0].attempts > 10)
      return { error: "Too many attempts. Try again in 15 minutes." };
    if (mode === "register") {
      const name = String(form.get("name") ?? "").trim();
      if (name.length < 2 || name.length > 100)
        return { error: "Enter a name between 2 and 100 characters." };
      if (password !== form.get("confirmPassword"))
        return { error: "Passwords do not match." };
      id = randomUUID();
      const result = await db.user.createMany({
        data: [{ id, name, email, password_hash: hashPassword(password) }],
        skipDuplicates: true,
      });
      if (!result.count)
        return { error: "Unable to create account. Try signing in instead." };
    } else {
      const result = await db.user.findUnique({
        where: { email },
        select: { id: true, password_hash: true },
      });
      const valid = verifyPassword(
        password,
        result?.password_hash ?? hashPassword("dummy-password-value"),
      );
      if (!result || !valid)
        return { error: "Email or password is incorrect." };
      id = result.id;
    }
    await createSession(id);
    await db.authAttempt.deleteMany({ where: { email } });
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
    await getDb().session.deleteMany({ where: { token_hash: digest(token) } });
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
    await getDb().project.create({
      data: {
        user_id: user.id,
        so_no: p.so,
        jo_no: p.jo,
        project_name: p.name,
        client: p.client,
        contract_price: p.price,
        category: p.category,
      },
    });
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
  await getDb().user.update({ where: { id: user.id }, data: { name } });
  revalidatePath("/profile");
  return { success: "Profile updated." };
}
