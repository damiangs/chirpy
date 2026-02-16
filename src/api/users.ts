import { Response, Request } from "express";

import { createUser } from "../db/queries/users.js";
import { respondWithJSON } from "./json.js";
import { BadRequestError } from "./errors.js";
import { checkPasswordHash, hashPassword } from "../auth.js";
import { getUserByEmail } from "../db/queries/users.js";

export async function handlerUsersCreate(req: Request, res: Response) {
  type parameters = {
    email: string;
    password: string;
  };
  const params: parameters = req.body;

  if (!params.email) {
    throw new BadRequestError("Missing required fields");
  }

  if (!params.password) {
    throw new BadRequestError("Missing required fields");
  }

  const hashedPassword = await hashPassword(params.password);

  const user = await createUser({ email: params.email, hashedPassword });

  if (!user) {
    throw new Error("Could not create user");
  }

  respondWithJSON(res, 201, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
}

export async function handlerLogin(req: Request, res: Response) {
  const { email, password } = req.body;

  const user = await getUserByEmail(email);

  if (!user || !(await checkPasswordHash(password, user.hashedPassword))) {
    return respondWithJSON(res, 401, {
      error: "incorrect email or password",
    });
  }

  respondWithJSON(res, 200, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
}
