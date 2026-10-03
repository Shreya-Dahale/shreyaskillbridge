import type { Prisma } from "@prisma/client";
import { TASK_LIBRARY } from "./library";
import { getOrCreateSkill } from "../skills/resolve";

type Db = Prisma.TransactionClient;

/** Copies the task library from code into the database. Safe to run repeatedly. */
export async function syncTasks(db: Db) {
  for (const def of TASK_LIBRARY) {
    const data = {
      title: def.title,
      kind: "JAVA_CODE" as const,
      instructions: def.instructions,
      starterCode: def.starterCode,
      timeLimitMs: def.timeLimitMs,
      active: true,
    };

    const task = await db.task.upsert({
      where: { slug: def.slug },
      update: data,
      create: { slug: def.slug, ...data },
    });

    await db.taskSkill.deleteMany({ where: { taskId: task.id } });
    for (const name of def.skills) {
      const skill = await getOrCreateSkill(db, name);
      await db.taskSkill.create({ data: { taskId: task.id, skillId: skill.id } });
    }

    await db.taskTestCase.deleteMany({ where: { taskId: task.id } });
    await db.taskTestCase.createMany({
      data: def.testCases.map((tc, index) => ({
        taskId: task.id,
        label: tc.label,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        hidden: tc.hidden,
        position: index,
      })),
    });
  }
}