import { s3 } from "bun";

import { createFileRoute } from "@tanstack/react-router";

import { db } from "@/lib/prisma.ts";

export const Route = createFileRoute("/$id")({
	server: {
		handlers: {
			GET: async ({ params, request }) => {
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
					const rangeHeader = request.headers.get("range");
					const { size, type } = await s3file.stat();
					if (rangeHeader) {
						// Parse incoming header format: "bytes=start-end"
						const parts = rangeHeader.replace(/bytes=/, "").split("-");
						console.log(`parts:  `, parts);
						const start = parseInt(parts[0], 10);
						const end = parts[1] ? parseInt(parts[1], 10) : size - 1;
						console.log(`start:  `, start);
						console.log(`end:  `, end);
						const contentLength = end - start + 1;
						console.log(`contentLength:  `, contentLength);
						// S3File.slice handles the range request to the cloud provider
						const fileSlice = s3file.slice(start, end + 1);

						return new Response(fileSlice.stream(), {
							headers: {
								"Accept-Ranges": "bytes",
								"Content-Length": contentLength.toString(),
								"Content-Range": `bytes ${start}-${end}/${size}`,
								"Content-Type": type,
							},
							status: 206,
						});
					}
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
