-- CreateEnum
CREATE TYPE "ExchangeType" AS ENUM ('DIRECT', 'MULTIPLE', 'PARTIAL', 'PENDING', 'INFO_INSUFFICIENT', 'NOT_AVAILABLE');

-- CreateEnum
CREATE TYPE "ExchangeStatus" AS ENUM ('DRAFT', 'PROPOSED', 'ACCEPTED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "ExchangeProposal" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "status" "ExchangeStatus" NOT NULL DEFAULT 'DRAFT',
    "type" "ExchangeType" NOT NULL,
    "stickersGivenByMe" TEXT[],
    "stickersGivenByOther" TEXT[],
    "pendingCountForMe" INTEGER NOT NULL DEFAULT 0,
    "pendingCountForOther" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExchangeProposal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExchangeProposal_fromUserId_idx" ON "ExchangeProposal"("fromUserId");

-- CreateIndex
CREATE INDEX "ExchangeProposal_toUserId_idx" ON "ExchangeProposal"("toUserId");

-- CreateIndex
CREATE INDEX "ExchangeProposal_status_idx" ON "ExchangeProposal"("status");

-- AddForeignKey
ALTER TABLE "ExchangeProposal" ADD CONSTRAINT "ExchangeProposal_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeProposal" ADD CONSTRAINT "ExchangeProposal_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
