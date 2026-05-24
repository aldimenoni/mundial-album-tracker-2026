import cors from "cors";
import express from "express";
import { albumsRouter } from "./modules/albums/albums.routes.js";
import { exchangesRouter } from "./modules/exchanges/exchanges.routes.js";
import { stickersRouter } from "./modules/stickers/stickers.routes.js";
import { usersRouter } from "./modules/users/users.routes.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { notFoundHandler } from "./middlewares/not-found.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "mundial-album-tracker-api" });
});

app.use("/stickers", stickersRouter);
app.use("/users", usersRouter);
app.use("/albums", albumsRouter);
app.use("/exchanges", exchangesRouter);

app.use(notFoundHandler);
app.use(errorHandler);
