import "dotenv/config";

import { PrismaLibSql } from "@prisma/adapter-libsql";

import { PrismaClient } from "../../generated/prisma/client.ts";

const adapter = new PrismaLibSql({
	url: process.env.DATABASE_URL ?? "",
});

declare global {
	var __prisma: PrismaClient | undefined;
}

export const db = globalThis.__prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
	globalThis.__prisma = db;
}
