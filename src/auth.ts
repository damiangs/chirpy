import { Request } from "express";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import crypto from "crypto";

import { UserNotAuthenticatedError, BadRequestError } from "./api/errors.js";

const TOKEN_ISSUER = "chirpy";

export async function hashPassword(password: string) {
  return argon2.hash(password);
}

export async function checkPasswordHash(password: string, hash: string) {
  if (!password) return false;
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function makeJWT(userID: string, expiresIn: number, secret: string) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + expiresIn;
  const token = jwt.sign(
    {
      iss: TOKEN_ISSUER,
      sub: userID,
      iat: issuedAt,
      exp: expiresAt,
    } satisfies payload,
    secret,
    { algorithm: "HS256" },
  );

  return token;
}

export function validateJWT(tokenString: string, secret: string) {
  let decoded: payload;
  try {
    decoded = jwt.verify(tokenString, secret) as JwtPayload;
  } catch (e) {
    throw new UserNotAuthenticatedError("Invalid token");
  }

  if (decoded.iss !== TOKEN_ISSUER) {
    throw new UserNotAuthenticatedError("Invalid issuer");
  }

  if (!decoded.sub) {
    throw new UserNotAuthenticatedError("No user ID in token");
  }

  return decoded.sub;
}

export function getBearerToken(req: Request) {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    throw new UserNotAuthenticatedError("Malformed authorization header");
  }

  const splittedHeader = authHeader.split(" ");

  if (splittedHeader.length < 2 || splittedHeader[0] !== "Bearer") {
    throw new UserNotAuthenticatedError("Malformed authorization header");
  }

  const token = splittedHeader[1];

  return token;
}

export function makeRefreshToken() {
  const randomData = crypto.randomBytes(32);
  const readableString = randomData.toString("hex");

  return readableString;
}

export function getAPIKey(req: Request) {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    throw new UserNotAuthenticatedError("Malformed authorization header");
  }

  const splittedHeader = authHeader.split(" ");

  if (splittedHeader.length < 2 || splittedHeader[0] !== "ApiKey") {
    throw new BadRequestError("Malformed authorization header");
  }

  const apiKey = splittedHeader[1];

  return apiKey;
}
