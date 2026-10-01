import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  await prisma.user.upsert({
    where: { email: "aditi@example.com" },
    update: {},
    create: {
      name: "Aditi Sharma",
      email: "aditi@example.com",
      passwordHash,
      role: "CANDIDATE",
      candidate: { create: { headline: "Java developer returning after a career break" } },
    },
  });

  await prisma.user.upsert({
    where: { email: "hr@acme.example.com" },
    update: {},
    create: {
      name: "Acme HR",
      email: "hr@acme.example.com",
      passwordHash,
      role: "EMPLOYER",
      employer: { create: { companyName: "Acme Technologies" } },
    },
  });
}

main().finally(() => prisma.$disconnect());