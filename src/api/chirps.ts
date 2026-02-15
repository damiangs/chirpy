import type { Request, Response } from "express";

import { respondWithJSON } from "./json.js";
import { BadRequestError } from "./errors.js";
import { createChirp } from "../db/queries/chirps.js";

export function validateAndCleanChirp(body: string) {
  const maxChirpLength = 140;
  if (body.length > maxChirpLength) {
    throw new BadRequestError(
      `Chirp is too long. Max length is ${maxChirpLength}`,
    );
  }

  const words = body.split(" ");
  const badWords = ["kerfuffle", "sharbert", "fornax"];

  for (let i = 0; i < words.length; i++) {
    if (badWords.includes(words[i].toLowerCase())) {
      words[i] = "****";
    }
  }

  return words.join(" ");
}

export async function handlerChirpsCreate(req: Request, res: Response) {
  const cleanedBody = validateAndCleanChirp(req.body.body);

  const chirp = await createChirp({
    body: cleanedBody,
    userId: req.body.userId,
  });

  respondWithJSON(res, 201, {
    id: chirp.id,
    createdAt: chirp.createdAt,
    updatedAt: chirp.updatedAt,
    body: chirp.body,
    userId: chirp.userId,
  });
}
