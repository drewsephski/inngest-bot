-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREDIT_CONSUMED', 'CREDIT_RESET', 'PRO_UPGRADE', 'PROJECT_CREATED', 'PROJECT_DELETED', 'MESSAGE_SENT', 'AI_SETTINGS_UPDATED', 'AI_SETTINGS_DELETED');

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "details" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageAnalytics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creditsConsumed" INTEGER NOT NULL DEFAULT 0,
    "projectsCreated" INTEGER NOT NULL DEFAULT 0,
    "messagesSent" INTEGER NOT NULL DEFAULT 0,
    "aiRequests" INTEGER NOT NULL DEFAULT 0,
    "provider" "AIProvider",

    CONSTRAINT "UsageAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "UsageAnalytics_userId_date_idx" ON "UsageAnalytics"("userId", "date");

-- CreateIndex
CREATE INDEX "UsageAnalytics_date_idx" ON "UsageAnalytics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "UsageAnalytics_userId_date_key" ON "UsageAnalytics"("userId", "date");

-- CreateIndex
CREATE INDEX "Fragment_messageId_idx" ON "Fragment"("messageId");

-- CreateIndex
CREATE INDEX "Fragment_createdAt_idx" ON "Fragment"("createdAt");

-- CreateIndex
CREATE INDEX "Message_projectId_createdAt_idx" ON "Message"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_projectId_idx" ON "Message"("projectId");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- CreateIndex
CREATE INDEX "Project_userId_createdAt_idx" ON "Project"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Project_userId_idx" ON "Project"("userId");

-- CreateIndex
CREATE INDEX "Usage_expire_idx" ON "Usage"("expire");

-- CreateIndex
CREATE INDEX "UserSettings_updatedAt_idx" ON "UserSettings"("updatedAt");
