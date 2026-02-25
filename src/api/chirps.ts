import type { Request, Response } from "express";

import { respondWithJSON } from "./json.js";
import {
  BadRequestError,
  NotFoundError,
  UserForbiddenError,
} from "./errors.js";
import {
  createChirp,
  getChirps,
  getChirp,
  deleteChirp,
} from "../db/queries/chirps.js";
import { getBearerToken, validateJWT } from "../auth.js";
import { config } from "../config.js";

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
  const token = getBearerToken(req);

  const userId = validateJWT(token, config.api.jwtSecret);

  const cleanedBody = validateAndCleanChirp(req.body.body);

  const chirp = await createChirp({
    body: cleanedBody,
    userId: userId,
  });

  respondWithJSON(res, 201, {
    id: chirp.id,
    createdAt: chirp.createdAt,
    updatedAt: chirp.updatedAt,
    body: chirp.body,
    userId: chirp.userId,
  });
}

export async function handlerChirpsRetrieve(req: Request, res: Response) {
  let authorId = "";
  let authorIdQuery = req.query.authorId;
  if (typeof authorIdQuery === "string") {
    authorId = authorIdQuery;
  }

  const chirps = await getChirps(authorId);

  let sortDirection = "asc";
  let sortDirectionParam = req.query.sort;
  if (sortDirectionParam === "desc") {
    sortDirection = "desc";
  }

  chirps.sort((a, b) =>
    sortDirection === "asc"
      ? a.createdAt.getTime() - b.createdAt.getTime()
      : b.createdAt.getTime() - a.createdAt.getTime(),
  );

  respondWithJSON(res, 200, chirps);
}

export async function handlerChirpsGet(req: Request, res: Response) {
  const chirpId = req.params.chirpId;

  if (typeof chirpId !== "string") {
    throw new BadRequestError("Invalid chirp ID");
  }

  const chirp = await getChirp(chirpId);

  if (!chirp) {
    throw new NotFoundError("Chirp not found");
  }

  respondWithJSON(res, 200, chirp);
}

export async function handlerChirpsDelete(req: Request, res: Response) {
  const { chirpId } = req.params;

  if (typeof chirpId !== "string") {
    throw new BadRequestError("invalid chirp ID");
  }

  const token = getBearerToken(req);

  const chirp = await getChirp(chirpId);

  if (!chirp) {
    throw new NotFoundError("Chirp not found");
  }

  const userId = validateJWT(token, config.api.jwtSecret);

  if (chirp.userId !== userId) {
    throw new UserForbiddenError("You can only delete your own chirps");
  }

  await deleteChirp(chirpId);

  res.status(204).send();
}
