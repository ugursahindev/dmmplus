-- CreateTable
CREATE TABLE "Institution" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Institution_name_key" ON "Institution"("name");

-- CreateIndex
CREATE INDEX "Institution_name_idx" ON "Institution"("name");

-- AlterTable: Add institutionId column to User
-- Note: SQLite doesn't support adding foreign keys directly with ALTER TABLE
-- The foreign key relationship will be enforced at the application level
ALTER TABLE "User" ADD COLUMN "institutionId" INTEGER;

-- CreateIndex for User.institutionId
CREATE INDEX "User_institutionId_idx" ON "User"("institutionId");

-- AlterTable: Add targetInstitutionId column to Case
ALTER TABLE "Case" ADD COLUMN "targetInstitutionId" INTEGER;

-- CreateIndex for Case.targetInstitutionId
CREATE INDEX "Case_targetInstitutionId_idx" ON "Case"("targetInstitutionId");
