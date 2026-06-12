-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "aiCreditLimit" INTEGER NOT NULL DEFAULT 500,
ADD COLUMN     "aiCreditUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "supportNotes" TEXT;
