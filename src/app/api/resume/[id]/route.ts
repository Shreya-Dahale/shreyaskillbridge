import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { readFile } from "@/lib/storage";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id || user.role !== "CANDIDATE") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const resume = await prisma.resume.findFirst({
    where: { id, candidate: { userId: user.id } },
  });
  if (!resume) return new NextResponse("Not found", { status: 404 });

  const data = await readFile(resume.storagePath);
  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="resume.pdf"',
    },
  });
}