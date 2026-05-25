ALTER TABLE "UserSticker" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "UserSticker_userId_updatedAt_idx" ON "UserSticker"("userId", "updatedAt");
