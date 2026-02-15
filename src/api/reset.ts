import type { Request, Response } from "express";
import { config } from "../config.js";
import { UserForbiddenError } from "./errors.js";
import { reset } from "../db/queries/users.js";

export async function handlerReset(_req: Request, res: Response) {
  if (config.api.platform !== "dev") {
    throw new UserForbiddenError(
      "Reset endpoint is only available in dev environment",
    );
  }

  await reset();

  config.api.fileServerHits = 0;
  res.write("Hits reset to 0");
  res.end();
}
