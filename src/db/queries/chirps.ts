import { db } from "../index.js";
import { chirps, NewChirp } from "../schema.js";
import { asc, eq } from "drizzle-orm";

export async function createChirp(chirp: NewChirp) {
  const [rows] = await db.insert(chirps).values(chirp).returning();

  return rows;
}

export async function getChirps() {
  const rows = await db.select().from(chirps).orderBy(asc(chirps.createdAt));

  return rows;
}

export async function getChirp(id: string) {
  const [row] = await db.select().from(chirps).where(eq(chirps.id, id));

  return row;
}
