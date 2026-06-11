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
				console.log("fileName", fileKey);
				console.log("data", data);
				const s3file = s3.file(fileKey, {
					contentDisposition: "inline",
					type: file.type,
				});
				await s3file
					.write(file, {
						type: file.type,
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
				db.file
					.create({
						data: {
							createdAt: new Date().toISOString(),
							ext: file.type.split("/")[1].split("+")[0],
							id: fileId,
							key: fileKey,
							name: file.name,
							size: file.size,
							type: file.type,
						},
					})
					.catch((err) => {
						console.error("Error saving file info to db", err);
					});
				return Response.json(
					{
						date: new Date().toISOString(),
						delete: `${getUrl()}/delete?key=${fileKey}`,
						ext: file.type.split("/")[1].split("+")[0],
						id: fileId,
						key: fileKey,
						link: `${getUrl()}/${fileId}`,
						name: file.name,
						size: file.size,
						status: "success",
						type: file.type,
					},
					{
						status: 200,
					},
				);
			},
		},
	},
});
