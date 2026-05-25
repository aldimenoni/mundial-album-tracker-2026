import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { listStickersQuerySchema, missingUsersQuerySchema, stickerCodeParamSchema } from "./stickers.schemas.js";
import { findUsersMissingSticker, listStickers } from "./stickers.service.js";

export const stickersRouter = Router();

stickersRouter.get(
  "/:code/missing-users",
  asyncHandler(async (req, res) => {
    const { code } = stickerCodeParamSchema.parse(req.params);
    const { viewerUserId } = missingUsersQuerySchema.parse(req.query);
    const result = await findUsersMissingSticker(code, viewerUserId);
    res.json(result);
  })
);

stickersRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const query = listStickersQuerySchema.parse(req.query);
    const stickers = await listStickers(query);
    res.json(stickers);
  })
);
