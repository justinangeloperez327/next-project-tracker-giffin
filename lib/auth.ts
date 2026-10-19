import { cache } from "react";
import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "./db";
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
  const session = await getDb().session.findFirst({
    where: { token_hash: digest(token), expires_at: { gt: new Date() } },
    select: { user: { select: { id: true, name: true, email: true } } },
  });
  return session?.user;
});
export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/");
  return user;
}
export async function createSession(id: string) {
  const token = randomBytes(32).toString("hex");
  const db = getDb();
  await db.session.deleteMany({ where: { expires_at: { lt: new Date() } } });
  await db.session.create({
    data: {
      token_hash: digest(token),
      user_id: id,
      expires_at: new Date(Date.now() + 604800000),
    },
  });
  (await cookies()).set("giffin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 604800,
  });
}
