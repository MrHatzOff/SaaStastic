-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');

-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'INCOMPLETE', 'INCOMPLETE_EXPIRED', 'PAST_DUE', 'TRIALING', 'UNPAID', 'PAUSED');

-- CreateEnum
CREATE TYPE "public"."InvoiceStatus" AS ENUM ('DRAFT', 'OPEN', 'PAID', 'UNCOLLECTIBLE', 'VOID');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserCompany" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "UserCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "notes" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EventLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "EventLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Feedback" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "rating" INTEGER,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Subscription" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT NOT NULL,
    "stripePriceId" TEXT NOT NULL,
    "stripeProductId" TEXT NOT NULL,
    "status" "public"."SubscriptionStatus" NOT NULL,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "canceledAt" TIMESTAMP(3),
    "trialStart" TIMESTAMP(3),
    "trialEnd" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Invoice" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "stripeInvoiceId" TEXT NOT NULL,
    "invoiceNumber" TEXT,
    "amountDue" INTEGER NOT NULL,
    "amountPaid" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" "public"."InvoiceStatus" NOT NULL,
    "dueDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "invoicePdf" TEXT,
    "hostedInvoiceUrl" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PaymentMethod" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "stripePaymentMethodId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "card" JSONB,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UsageRecord" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsageRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserInvitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'MEMBER',
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "invitedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "public"."User"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "public"."Company"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Company_stripeCustomerId_key" ON "public"."Company"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_stripeSubscriptionId_key" ON "public"."Company"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "Company_slug_idx" ON "public"."Company"("slug");

-- CreateIndex
CREATE INDEX "Company_deletedAt_idx" ON "public"."Company"("deletedAt");

-- CreateIndex
CREATE INDEX "Company_stripeCustomerId_idx" ON "public"."Company"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "Company_stripeSubscriptionId_idx" ON "public"."Company"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "UserCompany_companyId_idx" ON "public"."UserCompany"("companyId");

-- CreateIndex
CREATE INDEX "UserCompany_userId_idx" ON "public"."UserCompany"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCompany_userId_companyId_key" ON "public"."UserCompany"("userId", "companyId");

-- CreateIndex
CREATE INDEX "Customer_companyId_idx" ON "public"."Customer"("companyId");

-- CreateIndex
CREATE INDEX "Customer_email_idx" ON "public"."Customer"("email");

-- CreateIndex
CREATE INDEX "Customer_deletedAt_idx" ON "public"."Customer"("deletedAt");

-- CreateIndex
CREATE INDEX "Customer_companyId_createdAt_idx" ON "public"."Customer"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "EventLog_companyId_idx" ON "public"."EventLog"("companyId");

-- CreateIndex
CREATE INDEX "EventLog_userId_idx" ON "public"."EventLog"("userId");

-- CreateIndex
CREATE INDEX "EventLog_createdAt_idx" ON "public"."EventLog"("createdAt");

-- CreateIndex
CREATE INDEX "EventLog_action_idx" ON "public"."EventLog"("action");

-- CreateIndex
CREATE INDEX "EventLog_companyId_createdAt_idx" ON "public"."EventLog"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "Feedback_companyId_idx" ON "public"."Feedback"("companyId");

-- CreateIndex
CREATE INDEX "Feedback_userId_idx" ON "public"."Feedback"("userId");

-- CreateIndex
CREATE INDEX "Feedback_createdAt_idx" ON "public"."Feedback"("createdAt");

-- CreateIndex
CREATE INDEX "Feedback_companyId_createdAt_idx" ON "public"."Feedback"("companyId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_companyId_key" ON "public"."Subscription"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "public"."Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "Subscription_companyId_idx" ON "public"."Subscription"("companyId");

-- CreateIndex
CREATE INDEX "Subscription_stripeSubscriptionId_idx" ON "public"."Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "public"."Subscription"("status");

-- CreateIndex
CREATE INDEX "Subscription_currentPeriodEnd_idx" ON "public"."Subscription"("currentPeriodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_stripeInvoiceId_key" ON "public"."Invoice"("stripeInvoiceId");

-- CreateIndex
CREATE INDEX "Invoice_companyId_idx" ON "public"."Invoice"("companyId");

-- CreateIndex
CREATE INDEX "Invoice_stripeInvoiceId_idx" ON "public"."Invoice"("stripeInvoiceId");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "public"."Invoice"("status");

-- CreateIndex
CREATE INDEX "Invoice_createdAt_idx" ON "public"."Invoice"("createdAt");

-- CreateIndex
CREATE INDEX "Invoice_companyId_createdAt_idx" ON "public"."Invoice"("companyId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_stripePaymentMethodId_key" ON "public"."PaymentMethod"("stripePaymentMethodId");

-- CreateIndex
CREATE INDEX "PaymentMethod_companyId_idx" ON "public"."PaymentMethod"("companyId");

-- CreateIndex
CREATE INDEX "PaymentMethod_stripePaymentMethodId_idx" ON "public"."PaymentMethod"("stripePaymentMethodId");

-- CreateIndex
CREATE INDEX "PaymentMethod_isDefault_idx" ON "public"."PaymentMethod"("isDefault");

-- CreateIndex
CREATE INDEX "UsageRecord_companyId_idx" ON "public"."UsageRecord"("companyId");

-- CreateIndex
CREATE INDEX "UsageRecord_metric_idx" ON "public"."UsageRecord"("metric");

-- CreateIndex
CREATE INDEX "UsageRecord_timestamp_idx" ON "public"."UsageRecord"("timestamp");

-- CreateIndex
CREATE INDEX "UsageRecord_companyId_metric_timestamp_idx" ON "public"."UsageRecord"("companyId", "metric", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "UserInvitation_token_key" ON "public"."UserInvitation"("token");

-- CreateIndex
CREATE INDEX "UserInvitation_companyId_idx" ON "public"."UserInvitation"("companyId");

-- CreateIndex
CREATE INDEX "UserInvitation_token_idx" ON "public"."UserInvitation"("token");

-- CreateIndex
CREATE INDEX "UserInvitation_email_idx" ON "public"."UserInvitation"("email");

-- CreateIndex
CREATE INDEX "UserInvitation_expiresAt_idx" ON "public"."UserInvitation"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserInvitation_email_companyId_key" ON "public"."UserInvitation"("email", "companyId");

-- AddForeignKey
ALTER TABLE "public"."UserCompany" ADD CONSTRAINT "UserCompany_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserCompany" ADD CONSTRAINT "UserCompany_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Customer" ADD CONSTRAINT "Customer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventLog" ADD CONSTRAINT "EventLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventLog" ADD CONSTRAINT "EventLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Feedback" ADD CONSTRAINT "Feedback_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invoice" ADD CONSTRAINT "Invoice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentMethod" ADD CONSTRAINT "PaymentMethod_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UsageRecord" ADD CONSTRAINT "UsageRecord_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserInvitation" ADD CONSTRAINT "UserInvitation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserInvitation" ADD CONSTRAINT "UserInvitation_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
