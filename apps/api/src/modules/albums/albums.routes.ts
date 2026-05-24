import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  compareAlbumsParamsSchema,
  updateStickerParamsSchema,
  updateUserStickerSchema,
  userIdParamSchema
} from "./albums.schemas.js";
import {
  compareAlbums,
  getAlbum,
  getAlbumSummary,
  updateAlbumSticker
} from "./albums.service.js";

export const albumsRouter = Router();

albumsRouter.get(
  "/:userId",
  asyncHandler(async (req, res) => {
    const { userId } = userIdParamSchema.parse(req.params);
    const album = await getAlbum(userId);
    res.json(album);
  })
);

albumsRouter.put(
  "/:userId/stickers/:stickerId",
  asyncHandler(async (req, res) => {
    const { userId, stickerId } = updateStickerParamsSchema.parse(req.params);
    const input = updateUserStickerSchema.parse(req.body);
    const userSticker = await updateAlbumSticker(userId, stickerId, input);
    res.json(userSticker);
  })
);

albumsRouter.get(
  "/:userId/summary",
  asyncHandler(async (req, res) => {
    const { userId } = userIdParamSchema.parse(req.params);
    const summary = await getAlbumSummary(userId);
    res.json(summary);
  })
);

albumsRouter.get(
  "/:myUserId/compare/:otherUserId",
  asyncHandler(async (req, res) => {
    const { myUserId, otherUserId } = compareAlbumsParamsSchema.parse(req.params);
    const comparison = await compareAlbums(myUserId, otherUserId);
    res.json(comparison);
  })
);
