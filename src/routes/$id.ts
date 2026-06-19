import { s3 } from "bun";

import { createFileRoute } from "@tanstack/react-router";

import { db } from "@/lib/prisma.ts";

export const Route = createFileRoute("/$id")({
	server: {
		handlers: {
			GET: async ({ params }) => {
				const { id: idRaw } = params;
				const id = idRaw.split(".")[0];
				console.log("id:", id);
				const file = await db.file.findUnique({
					where: { id },
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

				if (await s3.file(file.key).exists()) {
					const s3file = s3.file(file.key, {
						contentDisposition: "inline",
					});
					console.log(`file.type:  `, file.type);

					return new Response(s3file.stream(), {
						headers: {
							"Accept-Ranges": "bytes",
							"Content-Length": file.size.toString(),
							"Content-Type": file.type,
						},
					});
				} else {
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
			},
		},
	},
});
