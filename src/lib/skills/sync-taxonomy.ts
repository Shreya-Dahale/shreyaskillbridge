import type { Prisma } from "@prisma/client";
import { TAXONOMY_SKILLS, TAXONOMY_RELATIONS } from "./taxonomy";
import { slugify } from "./slug";

type Db = Prisma.TransactionClient;

/** Copies the taxonomy from code into the database. Safe to run repeatedly. */
export async function syncTaxonomy(db: Db) {
  const idBySlug = new Map<string, string>();

  for (const s of TAXONOMY_SKILLS) {
    const slug = slugify(s.name);
    const skill = await db.skill.upsert({
      where: { slug },
      update: { name: s.name },
      create: { slug, name: s.name },
    });
    idBySlug.set(slug, skill.id);
  }

  for (const s of TAXONOMY_SKILLS) {
    const skillId = idBySlug.get(slugify(s.name))!;
    for (const alias of s.aliases) {
      const aliasSlug = slugify(alias);
      if (!aliasSlug || aliasSlug === slugify(s.name)) continue;
      await db.skillAlias.upsert({
        where: { alias: aliasSlug },
        update: { skillId },
        create: { alias: aliasSlug, skillId },
      });
    }
  }

  for (const r of TAXONOMY_RELATIONS) {
    const fromId = idBySlug.get(slugify(r.from));
    const toId = idBySlug.get(slugify(r.to));
    if (!fromId || !toId) throw new Error(`Unknown skill in relation: ${r.from} -> ${r.to}`);
    await db.skillRelation.upsert({
      where: { fromId_toId: { fromId, toId } },
      update: { kind: r.kind },
      create: { fromId, toId, kind: r.kind },
    });
  }
}