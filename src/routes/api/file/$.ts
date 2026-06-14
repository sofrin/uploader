import { s3 } from "bun";

import { createFileRoute } from "@tanstack/react-router";
import { customAlphabet, nanoid } from "nanoid";

import { db } from "@/lib/prisma.ts";
import { getUrl } from "@/lib/utils.ts";

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
				const s3file = s3.file(fileKey, {
					contentDisposition: "inline",
					type: fileType,
				});
				await s3file
					.write(file, {
						type: fileType,
					})
					.then((res) => {
						console.log("File written successfully", res);
					})
					.catch((err) => {
						console.error("Error writing file", err);
						return Response.json(
							{
								status: "failure",
							},
							{
								status: 500,
							},
						);
					});
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
