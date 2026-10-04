-- CreateEnum
CREATE TYPE "ShareAudience" AS ENUM ('EMPLOYERS', 'ANYONE');

-- CreateTable
CREATE TABLE "ShareLink" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "label" TEXT,
    "tokenHash" TEXT NOT NULL,
    "audience" "ShareAudience" NOT NULL DEFAULT 'EMPLOYERS',
    "showName" BOOLEAN NOT NULL DEFAULT false,
    "includeHeadline" BOOLEAN NOT NULL DEFAULT true,
    "includeSkills" BOOLEAN NOT NULL DEFAULT true,
    "includeAssessments" BOOLEAN NOT NULL DEFAULT true,
    "includeSummary" BOOLEAN NOT NULL DEFAULT true,
    "includeRoles" BOOLEAN NOT NULL DEFAULT false,
    "includeBreak" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShareLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShareView" (
    "id" TEXT NOT NULL,
    "shareLinkId" TEXT NOT NULL,
    "viewerEmployerId" TEXT,
    "viewerCompany" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShareView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShareLink_tokenHash_key" ON "ShareLink"("tokenHash");

-- CreateIndex
CREATE INDEX "ShareLink_candidateId_idx" ON "ShareLink"("candidateId");

-- CreateIndex
CREATE INDEX "ShareView_shareLinkId_viewedAt_idx" ON "ShareView"("shareLinkId", "viewedAt");

-- AddForeignKey
ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareView" ADD CONSTRAINT "ShareView_shareLinkId_fkey" FOREIGN KEY ("shareLinkId") REFERENCES "ShareLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareView" ADD CONSTRAINT "ShareView_viewerEmployerId_fkey" FOREIGN KEY ("viewerEmployerId") REFERENCES "EmployerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
