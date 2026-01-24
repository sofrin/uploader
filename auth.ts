import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from "@/lib/prisma";

export const auth = betterAuth({
	database: prismaAdapter(db, {
		provider: "sqlite",
	}),
	appName: "uploader",
	plugins: [admin(), tanstackStartCookies()],
});
