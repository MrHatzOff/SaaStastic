-- CreateEnum
CREATE TYPE "LicenseTier" AS ENUM ('STARTER', 'PROFESSIONAL', 'AGENCY', 'ENTERPRISE', 'FOREVER');

-- CreateEnum
CREATE TYPE "SupportStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateTable
CREATE TABLE "LicenseCustomer" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "tier" "LicenseTier" NOT NULL,
    "licenseKey" TEXT NOT NULL,
    "githubUsername" TEXT,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "renewalDate" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "supportHours" INTEGER NOT NULL DEFAULT 0,
    "supportExpiresAt" TIMESTAMP(3),
    "lemonSqueezyOrderId" TEXT,
    "lemonSqueezyCustomerId" TEXT,
    "lemonSqueezySubscriptionId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isCancelled" BOOLEAN NOT NULL DEFAULT false,
    "cancelledAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LicenseCustomer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportSession" (
    "id" TEXT NOT NULL,
    "licenseCustomerId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "durationMinutes" INTEGER NOT NULL DEFAULT 60,
    "hoursUsed" INTEGER NOT NULL DEFAULT 1,
    "topic" TEXT,
    "notes" TEXT,
    "recording" TEXT,
    "status" "SupportStatus" NOT NULL DEFAULT 'SCHEDULED',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LicenseCustomer_email_key" ON "LicenseCustomer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "LicenseCustomer_licenseKey_key" ON "LicenseCustomer"("licenseKey");

-- CreateIndex
CREATE UNIQUE INDEX "LicenseCustomer_lemonSqueezyOrderId_key" ON "LicenseCustomer"("lemonSqueezyOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "LicenseCustomer_lemonSqueezySubscriptionId_key" ON "LicenseCustomer"("lemonSqueezySubscriptionId");

-- CreateIndex
CREATE INDEX "LicenseCustomer_email_idx" ON "LicenseCustomer"("email");

-- CreateIndex
CREATE INDEX "LicenseCustomer_tier_idx" ON "LicenseCustomer"("tier");

-- CreateIndex
CREATE INDEX "LicenseCustomer_licenseKey_idx" ON "LicenseCustomer"("licenseKey");

-- CreateIndex
CREATE INDEX "LicenseCustomer_isActive_idx" ON "LicenseCustomer"("isActive");

-- CreateIndex
CREATE INDEX "LicenseCustomer_lemonSqueezyOrderId_idx" ON "LicenseCustomer"("lemonSqueezyOrderId");

-- CreateIndex
CREATE INDEX "LicenseCustomer_lemonSqueezyCustomerId_idx" ON "LicenseCustomer"("lemonSqueezyCustomerId");

-- CreateIndex
CREATE INDEX "SupportSession_licenseCustomerId_idx" ON "SupportSession"("licenseCustomerId");

-- CreateIndex
CREATE INDEX "SupportSession_scheduledAt_idx" ON "SupportSession"("scheduledAt");

-- CreateIndex
CREATE INDEX "SupportSession_status_idx" ON "SupportSession"("status");

-- AddForeignKey
ALTER TABLE "SupportSession" ADD CONSTRAINT "SupportSession_licenseCustomerId_fkey" FOREIGN KEY ("licenseCustomerId") REFERENCES "LicenseCustomer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
