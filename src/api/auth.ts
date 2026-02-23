import {
  saveRefreshToken,
  userForRefreshToken,
  revokeRefreshToken,
} from "../db/queries/refresh.js";
import { getUserByEmail } from "../db/queries/users.js";
import {
  checkPasswordHash,
  makeRefreshToken,
  makeJWT,
  getBearerToken,
} from "../auth.js";
import { respondWithJSON } from "./json.js";
import { UserNotAuthenticatedError } from "./errors.js";

import type { Request, Response } from "express";
import type { UserResponse } from "./users.js";
import { config } from "../config.js";

export async function handlerLogin(req: Request, res: Response) {
  type parameters = {
    password: string;
    email: string;
  };

  type LoginResponse = UserResponse & {
    token: string;
    refreshToken: string;
  };

  const params: parameters = req.body;

  const user = await getUserByEmail(params.email);
  if (!user) {
    throw new UserNotAuthenticatedError("incorrect email or password");
  }

  const matching = await checkPasswordHash(
    params.password,
    user.hashedPassword,
  );
  if (!matching) {
    throw new UserNotAuthenticatedError("incorrect email or password");
  }

  const accessToken = makeJWT(user.id, 3600, config.api.jwtSecret);

  const refreshToken = makeRefreshToken();

  const savedToken = await saveRefreshToken(user.id, refreshToken);

  if (!savedToken) {
    throw new UserNotAuthenticatedError("Could not save refresh token");
  }

  respondWithJSON(res, 200, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    token: accessToken,
    refreshToken: refreshToken,
    isChirpyRed: user.isChirpyRed,
  } satisfies LoginResponse);
}

export async function handlerRefresh(req: Request, res: Response) {
  const refreshToken = getBearerToken(req);

  const result = await userForRefreshToken(refreshToken);

  if (!result) {
    throw new UserNotAuthenticatedError("No token found");
  }

  const user = result.user;

  const newAccessToken = makeJWT(user.id, 3600, config.api.jwtSecret);

  respondWithJSON(res, 200, {
    token: newAccessToken,
  });
}

export async function handlerRevoke(req: Request, res: Response) {
  const revokeToken = getBearerToken(req);

  await revokeRefreshToken(revokeToken);

  res.status(204).send();
}
