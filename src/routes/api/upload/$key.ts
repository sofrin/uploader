import { s3 } from "bun";

import { createFileRoute } from "@tanstack/react-router";

import { db } from "@/lib/prisma.ts";

export const Route = createFileRoute("/api/upload/$key")({
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
							status: "failure",
							reason: "File not found",
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
		},
	},
});
