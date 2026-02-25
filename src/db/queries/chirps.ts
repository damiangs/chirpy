import { db } from "../index.js";
import { chirps, NewChirp } from "../schema.js";
import { asc, eq } from "drizzle-orm";

export async function createChirp(chirp: NewChirp) {
  const [rows] = await db.insert(chirps).values(chirp).returning();

  return rows;
}

export async function getChirps(authorId?: string) {
  const rows = await db
    .select()
    .from(chirps)
    .where(authorId ? eq(chirps.userId, authorId) : undefined)
    .orderBy(asc(chirps.createdAt));

  return rows;
}

export async function getChirp(id: string) {
  const [row] = await db.select().from(chirps).where(eq(chirps.id, id));

  return row;
}

export async function deleteChirp(id: string) {
  const result = await db.delete(chirps).where(eq(chirps.id, id));
  return result.length > 0;
}
