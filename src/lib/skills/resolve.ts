import type { Prisma } from "@prisma/client";
import { canonicalSkill } from "./canonical";

type Db = Prisma.TransactionClient;

/** Finds or creates the shared Skill row for any typed skill name. */
export async function getOrCreateSkill(db: Db, name: string) {
  const { slug, name: canonicalName } = canonicalSkill(name);
  return db.skill.upsert({
    where: { slug },
    update: {},
    create: { slug, name: canonicalName },
  });
}