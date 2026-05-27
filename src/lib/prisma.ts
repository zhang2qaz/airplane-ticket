import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const dbUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const sqliteFile = dbUrl.startsWith("file:") ? dbUrl.slice("file:".length) : dbUrl;
const absoluteSqlite = path.isAbsolute(sqliteFile)
  ? sqliteFile
  : path.resolve(/* turbopackIgnore: true */ process.cwd(), sqliteFile);

const adapter = new PrismaBetterSqlite3({ url: absoluteSqlite });

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
