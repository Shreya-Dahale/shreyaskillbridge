-- CreateTable
CREATE TABLE "TargetJob" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TargetJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TargetJob_jobId_idx" ON "TargetJob"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "TargetJob_candidateId_jobId_key" ON "TargetJob"("candidateId", "jobId");

-- AddForeignKey
ALTER TABLE "TargetJob" ADD CONSTRAINT "TargetJob_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TargetJob" ADD CONSTRAINT "TargetJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
