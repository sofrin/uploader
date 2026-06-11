import { s3 } from "bun";

import { createFileRoute } from "@tanstack/react-router";

import { db } from "@/lib/prisma.ts";

export const Route = createFileRoute("/api/file/$key")({
	server: {
		handlers: {
			DELETE: async ({ params }) => {
				const { key } = params;
				const file = await db.file.findUnique({
					where: { key },
				});
				console.log("key", key);
				console.log("file", file);
				if (!file) {
					return Response.json(
						{
							reason: "File not found",
							status: "failure",
						},
						{
							status: 404,
						},
					);
				}
				await s3.file(file.key).delete();
				await db.file.delete({
					where: { key },
				});
				return Response.json({
					status: "success",
				});
			},
			GET: async ({ params }) => {
				const { key } = params;

				const file = await db.file.findUnique({
					where: { key },
				});
				if (!file) {
					return Response.json(
						{
							reason: "File not found",
							status: "failure",
						},
						{
							status: 404,
						},
					);
				}
				return Response.json(file, {
					status: 200,
				});
			},
		},
	},
});
