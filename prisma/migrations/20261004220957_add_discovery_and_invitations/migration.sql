-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateTable
CREATE TABLE "DiscoverySettings" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "code" TEXT NOT NULL,
    "includeHeadline" BOOLEAN NOT NULL DEFAULT true,
    "includeSkills" BOOLEAN NOT NULL DEFAULT true,
    "includeAssessments" BOOLEAN NOT NULL DEFAULT true,
    "includeSummary" BOOLEAN NOT NULL DEFAULT true,
    "includeRoles" BOOLEAN NOT NULL DEFAULT false,
    "includeBreak" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscoverySettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "employerId" TEXT NOT NULL,
    "jobId" TEXT,
    "candidateId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "respondedAt" TIMESTAMP(3),
    "contactName" TEXT,
    "contactEmail" TEXT,
    "candidateReadAt" TIMESTAMP(3),
    "employerReadAt" TIMESTAMP(3),

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyBlock" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "employerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscoveryView" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "employerId" TEXT,
    "companyName" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscoveryView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiscoverySettings_candidateId_key" ON "DiscoverySettings"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscoverySettings_code_key" ON "DiscoverySettings"("code");

-- CreateIndex
CREATE INDEX "Invitation_candidateId_status_idx" ON "Invitation"("candidateId", "status");

-- CreateIndex
CREATE INDEX "Invitation_employerId_createdAt_idx" ON "Invitation"("employerId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_jobId_candidateId_key" ON "Invitation"("jobId", "candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyBlock_candidateId_employerId_key" ON "CompanyBlock"("candidateId", "employerId");

-- CreateIndex
CREATE INDEX "DiscoveryView_candidateId_viewedAt_idx" ON "DiscoveryView"("candidateId", "viewedAt");

-- AddForeignKey
ALTER TABLE "DiscoverySettings" ADD CONSTRAINT "DiscoverySettings_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "EmployerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyBlock" ADD CONSTRAINT "CompanyBlock_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyBlock" ADD CONSTRAINT "CompanyBlock_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "EmployerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscoveryView" ADD CONSTRAINT "DiscoveryView_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscoveryView" ADD CONSTRAINT "DiscoveryView_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "EmployerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
