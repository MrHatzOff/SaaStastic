/*
  Warnings:

  - A unique constraint covering the columns `[slug,companyId]` on the table `roles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `roles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."roles" ADD COLUMN "slug" TEXT;

UPDATE "public"."roles"
SET "slug" = CASE
  WHEN lower("name") = 'owner' THEN 'system-owner'
  WHEN lower("name") = 'admin' THEN 'system-admin'
  WHEN lower("name") = 'member' THEN 'system-member'
  WHEN lower("name") = 'viewer' THEN 'system-viewer'
  ELSE CONCAT('role-', SUBSTR("id", 1, 12))
END;

ALTER TABLE "public"."roles" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "roles_slug_companyId_key" ON "public"."roles"("slug", "companyId");
