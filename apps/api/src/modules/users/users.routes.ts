import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { createUserSchema } from "./users.schemas.js";
import { createUser, listUsers } from "./users.service.js";

export const usersRouter = Router();

usersRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = createUserSchema.parse(req.body);
    const user = await createUser(input);
    res.status(201).json(user);
  })
);

usersRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const users = await listUsers();
    res.json(users);
  })
);
