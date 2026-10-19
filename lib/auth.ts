import { cache } from "react";
import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return salt + ":" + scryptSync(password, salt, 64).toString("hex");
}
export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return expected.length === actual.length && timingSafeEqual(actual, expected);
}
export const digest = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export const currentUser = cache(async function currentUser() {
  const token = (await cookies()).get("giffin_session")?.value;
  if (!token) return null;
  const result = await db.query(
    "SELECT u.id,u.name,u.email FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.token_hash=$1 AND s.expires_at>now()",
    [digest(token)],
  );
  return result.rows[0] as
    { id: string; name: string; email: string } | undefined;
});
export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/");
  return user;
}
export async function createSession(id: string) {
  const token = randomBytes(32).toString("hex");
  await db.query("DELETE FROM sessions WHERE expires_at < now()");
  await db.query("INSERT INTO sessions VALUES($1,$2,now()+interval '7 days')", [
    digest(token),
    id,
  ]);
  (await cookies()).set("giffin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 604800,
  });
}
