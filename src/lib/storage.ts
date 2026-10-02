import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const ROOT = path.join(process.cwd(), "uploads");

function resolveSafe(storagePath: string) {
  const full = path.resolve(ROOT, storagePath);
  if (!full.startsWith(ROOT + path.sep)) throw new Error("Invalid path");
  return full;
}

export async function saveFile(folder: string, data: Buffer, ext: string) {
  const dir = path.join(ROOT, folder);
  await fs.mkdir(dir, { recursive: true });
  const name = `${randomUUID()}${ext}`;
  await fs.writeFile(path.join(dir, name), data);
  return `${folder}/${name}`;
}

export async function readFile(storagePath: string) {
  return fs.readFile(resolveSafe(storagePath));
}

export async function deleteFile(storagePath: string) {
  await fs.rm(resolveSafe(storagePath), { force: true });
}