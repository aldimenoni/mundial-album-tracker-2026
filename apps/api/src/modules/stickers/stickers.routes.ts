import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { listStickersQuerySchema } from "./stickers.schemas.js";
import { listStickers } from "./stickers.service.js";

export const stickersRouter = Router();

stickersRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const query = listStickersQuerySchema.parse(req.query);
    const stickers = await listStickers(query);
    res.json(stickers);
  })
);
