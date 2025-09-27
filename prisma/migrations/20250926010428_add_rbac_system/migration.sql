-- AlterTable
ALTER TABLE "public"."UserCompany" ADD COLUMN     "roleId" TEXT;

-- AlterTable
ALTER TABLE "public"."UserInvitation" ADD COLUMN     "roleId" TEXT;

-- CreateTable
CREATE TABLE "public"."permissions" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_RolePermissions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RolePermissions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "permissions_key_key" ON "public"."permissions"("key");

-- CreateIndex
CREATE INDEX "permissions_category_idx" ON "public"."permissions"("category");

-- CreateIndex
CREATE INDEX "permissions_isSystem_idx" ON "public"."permissions"("isSystem");

-- CreateIndex
CREATE INDEX "roles_companyId_idx" ON "public"."roles"("companyId");

-- CreateIndex
CREATE INDEX "roles_isSystem_idx" ON "public"."roles"("isSystem");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_companyId_key" ON "public"."roles"("name", "companyId");

-- CreateIndex
CREATE INDEX "_RolePermissions_B_index" ON "public"."_RolePermissions"("B");

-- CreateIndex
CREATE INDEX "UserCompany_roleId_idx" ON "public"."UserCompany"("roleId");

-- CreateIndex
CREATE INDEX "UserInvitation_roleId_idx" ON "public"."UserInvitation"("roleId");

-- AddForeignKey
ALTER TABLE "public"."UserCompany" ADD CONSTRAINT "UserCompany_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserInvitation" ADD CONSTRAINT "UserInvitation_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."roles" ADD CONSTRAINT "roles_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_RolePermissions" ADD CONSTRAINT "_RolePermissions_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_RolePermissions" ADD CONSTRAINT "_RolePermissions_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
