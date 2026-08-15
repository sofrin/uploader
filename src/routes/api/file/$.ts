import { PutObjectCommand } from "@aws-sdk/client-s3";
import { createFileRoute } from "@tanstack/react-router";
import { customAlphabet, nanoid } from "nanoid";

import { db } from "@/lib/prisma.ts";
import { getUrl } from "@/lib/utils.ts";
import { s3 } from "@/routes/$id.ts";

const maxFileSize = 1048576 * 100;
const genId = customAlphabet(
	"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
	6,
);
export const Route = createFileRoute("/api/file/$")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const data = await request.formData();
				const file = data.get("file") as File;
				const fileType =
					file.type !== "" ? file.type : data.get("type")?.toString();
				if (!(file instanceof File))
					return Response.json(
						{ reason: "Invalid file", status: "failure" },
						{
							status: 400,
						},
					);

				if (file.size > maxFileSize) {
					return Response.json(
						{
							reason: "File size too large",
							status: "failure",
						},
						{
							status: 400,
						},
					);
				}

				const fileKey = nanoid();
				const putObjectCommand = new PutObjectCommand({
					Body: await file.bytes(),
					Bucket: "sofrin",
					ContentLength: file.size,
					ContentType: file.type,
					Key: fileKey,
				});

				await s3.send(putObjectCommand);

				const fileId = genId();
				await db.file
					.create({
						data: {
							createdAt: new Date().toISOString(),
							ext: fileType ? fileType.split("/")[1].split("+")[0] : "png",
							id: fileId,
							key: fileKey,
							name: file.name,
							size: file.size,
							type: fileType ?? "image/png",
						},
					})
					.catch((err) => {
						console.error("Error saving file info to db", err);
					});
				return Response.json(
					{
						date: new Date().toISOString(),
						delete: `${getUrl()}/delete?key=${fileKey}`,
						ext: fileType ? fileType.split("/")[1].split("+")[0] : "png",
						id: fileId,
						key: fileKey,
						link: `${getUrl()}/${fileId}`,
						name: file.name,
						size: file.size,
						status: "success",
						type: fileType,
					},
					{
						status: 200,
					},
				);
			},
		},
	},
});
