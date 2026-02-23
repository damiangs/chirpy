import type { Request, Response } from "express";
import { upgradeChirpyRed } from "../db/queries/users.js";
import { getAPIKey } from "../auth.js";
import { config } from "../config.js";

export async function handlerWebhook(req: Request, res: Response) {
  const apiKey = getAPIKey(req);
  if (apiKey !== config.api.polkaApiKey) {
    res.status(401).send();
    return;
  }

  const { event, data } = req.body;

  if (event !== "user.upgraded") {
    res.status(204).send();

    return;
  }

  const upgradedUser = await upgradeChirpyRed(data.userId);

  if (!upgradedUser) {
    res.status(404).send();

    return;
  }

  res.status(204).send();

  return;
}
