-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('NEW', 'SKETCHED', 'ACCEPTED', 'DECLINED');

-- Additive: every brief already filed starts where it stood, unanswered.
ALTER TABLE "commission_requests" ADD COLUMN "status" "CommissionStatus" NOT NULL DEFAULT 'NEW';

-- CreateIndex
CREATE INDEX "commission_requests_status_created_at_idx" ON "commission_requests"("status", "created_at");
