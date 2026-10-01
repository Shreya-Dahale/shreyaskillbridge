-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "extractedAt" TIMESTAMP(3),
ADD COLUMN     "extractionJson" JSONB;
