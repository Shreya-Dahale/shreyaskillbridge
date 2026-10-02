-- CreateEnum
CREATE TYPE "SkillRelationKind" AS ENUM ('IMPLIES', 'RELATED');

-- CreateTable
CREATE TABLE "SkillAlias" (
    "id" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "SkillAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillRelation" (
    "id" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "kind" "SkillRelationKind" NOT NULL,

    CONSTRAINT "SkillRelation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SkillAlias_alias_key" ON "SkillAlias"("alias");

-- CreateIndex
CREATE INDEX "SkillAlias_skillId_idx" ON "SkillAlias"("skillId");

-- CreateIndex
CREATE INDEX "SkillRelation_toId_idx" ON "SkillRelation"("toId");

-- CreateIndex
CREATE UNIQUE INDEX "SkillRelation_fromId_toId_key" ON "SkillRelation"("fromId", "toId");

-- AddForeignKey
ALTER TABLE "SkillAlias" ADD CONSTRAINT "SkillAlias_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillRelation" ADD CONSTRAINT "SkillRelation_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillRelation" ADD CONSTRAINT "SkillRelation_toId_fkey" FOREIGN KEY ("toId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
