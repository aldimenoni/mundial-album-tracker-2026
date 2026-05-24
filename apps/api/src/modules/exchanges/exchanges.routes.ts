import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { createExchangeSchema, finalizeExchangeSchema } from "./exchanges.schemas.js";
import {
  createExchangeProposal,
  executeExchange,
  finalizeExchange,
  listPendingSettlements
} from "./exchanges.service.js";

export const exchangesRouter = Router();

exchangesRouter.get(
  "/pending/:userId",
  asyncHandler(async (req, res) => {
    const userId = req.params.userId;

    if (typeof userId !== "string") {
      res.status(400).json({ message: "userId inválido." });
      return;
    }

    const settlements = await listPendingSettlements(userId);
    res.json(settlements);
  })
);

exchangesRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = createExchangeSchema.parse(req.body);
    const proposal = await createExchangeProposal({
      fromUserId: parsed.fromUserId,
      toUserId: parsed.toUserId,
      ...(parsed.status ? { status: parsed.status } : {}),
      ...(parsed.notes ? { notes: parsed.notes } : {})
    });
    res.status(201).json(proposal);
  })
);

exchangesRouter.post(
  "/execute",
  asyncHandler(async (req, res) => {
    const parsed = createExchangeSchema.parse(req.body);
    const result = await executeExchange({
      fromUserId: parsed.fromUserId,
      toUserId: parsed.toUserId,
      ...(parsed.notes ? { notes: parsed.notes } : {}),
      ...(parsed.stickersGivenByMe ? { stickersGivenByMe: parsed.stickersGivenByMe } : {}),
      ...(parsed.stickersGivenByOther ? { stickersGivenByOther: parsed.stickersGivenByOther } : {}),
      ...(parsed.custom ? { custom: parsed.custom } : {})
    });
    res.status(200).json(result);
  })
);

exchangesRouter.post(
  "/:proposalId/finalize",
  asyncHandler(async (req, res) => {
    const proposalId = req.params.proposalId;

    if (typeof proposalId !== "string") {
      res.status(400).json({ message: "proposalId inválido." });
      return;
    }

    const parsed = finalizeExchangeSchema.parse(req.body);
    const result = await finalizeExchange(
      proposalId,
      parsed.userId,
      parsed.stickersGivenByMe,
      parsed.stickersGivenByOther
    );
    res.status(200).json(result);
  })
);
